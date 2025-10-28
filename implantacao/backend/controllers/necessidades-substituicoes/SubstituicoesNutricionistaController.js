const { executeQuery } = require('../../config/database');

/**
 * Controller para substituições do nutricionista
 * Status: 'pendente' (criação e edição)
 */
class SubstituicoesNutricionistaController {
  /**
   * Listar necessidades para nutricionista (status CONF, sem substituições)
   */
  static async listarParaNutricionista(req, res) {
    try {
      const { grupo, semana_abastecimento, semana_consumo } = req.query;

      let whereConditions = ["n.status = 'CONF'"];
      let params = [];

      // Filtro por grupo
      if (grupo) {
        whereConditions.push(`n.produto_id IN (
          SELECT DISTINCT ppc.produto_id 
          FROM produtos_per_capita ppc 
          WHERE ppc.grupo = ?
        )`);
        params.push(grupo);
      }

      // Filtro por semana de abastecimento
      if (semana_abastecimento) {
        const semanaAbastNormalizada = semana_abastecimento.replace(/[()]/g, '').replace(/\/25$/, '').trim();
        const dataInicial = semanaAbastNormalizada.split(' a ')[0].trim();
        whereConditions.push("n.semana_abastecimento LIKE ?");
        params.push(`${dataInicial}%`);
      }

      // Filtro por semana de consumo
      if (semana_consumo) {
        const semanaConsumoNormalizada = semana_consumo.replace(/[()]/g, '').replace(/\/25$/, '').trim();
        const dataInicial = semanaConsumoNormalizada.split(' a ')[0].trim();
        whereConditions.push("n.semana_consumo LIKE ?");
        params.push(`${dataInicial}%`);
      }

      // Buscar necessidades agrupadas por produto origem (sem substituições)
      const necessidades = await executeQuery(`
        SELECT 
          n.produto_id as codigo_origem,
          n.produto as produto_origem_nome,
          n.produto_unidade as produto_origem_unidade,
          SUM(n.ajuste_coordenacao) as quantidade_total_origem,
          GROUP_CONCAT(DISTINCT n.necessidade_id) as necessidade_ids,
          n.semana_abastecimento,
          n.semana_consumo,
          (SELECT ppc.grupo FROM produtos_per_capita ppc WHERE ppc.produto_id = n.produto_id LIMIT 1) as grupo,
          GROUP_CONCAT(
            DISTINCT CONCAT(
              n.id, '|',
              n.escola_id, '|',
              n.escola, '|',
              n.ajuste_coordenacao
            ) SEPARATOR '::'
          ) as escolas_solicitantes
        FROM necessidades n
        WHERE ${whereConditions.join(' AND ')}
          AND n.produto_id NOT IN (
            SELECT DISTINCT ns.produto_origem_id 
            FROM necessidades_substituicoes ns 
            WHERE ns.ativo = 1 
              AND ns.status IN ('pendente', 'aprovado', 'conf')
          )
        GROUP BY n.produto_id, n.produto, n.produto_unidade, n.semana_abastecimento, n.semana_consumo
        ORDER BY n.produto ASC
      `, params);

      // Processar escolas solicitantes
      const produtosComEscolas = necessidades.map(necessidade => {
        const escolas = necessidade.escolas_solicitantes
          .split('::')
          .map(escolaStr => {
            const [necessidade_id, escola_id, escola_nome, quantidade] = escolaStr.split('|');
            return {
              necessidade_id: parseInt(necessidade_id),
              escola_id: parseInt(escola_id),
              escola_nome,
              quantidade_origem: parseFloat(quantidade),
              substituicao: null // Sem substituições para nutricionista
            };
          });

        return {
          ...necessidade,
          escolas,
          substituicoes_existentes: false
        };
      });

      res.json({
        success: true,
        data: produtosComEscolas
      });
    } catch (error) {
      console.error('Erro ao listar necessidades para nutricionista:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Erro ao listar necessidades para nutricionista'
      });
    }
  }

  /**
   * Iniciar ajustes (criar registros iniciais com status 'conf')
   */
  static async iniciarAjustes(req, res) {
    try {
      const { necessidades } = req.body;
      const usuario_id = req.user.id;

      if (!necessidades || !Array.isArray(necessidades)) {
        return res.status(400).json({
          success: false,
          message: 'Necessidades são obrigatórias'
        });
      }

      let sucessos = 0;
      let erros = 0;
      const errosDetalhados = [];

      for (const necessidade of necessidades) {
        try {
          // Buscar produto padrão do produto origem no Foods
          let produtoPadraoId = null;
          try {
            const foodsApiUrl = process.env.FOODS_API_URL || 'http://localhost:3001';
            const axios = require('axios');
            const produtoOrigemResponse = await axios.get(`${foodsApiUrl}/produto-origem/${necessidade.codigo_origem}`, {
              headers: {
                'Authorization': req.headers.authorization
              },
              timeout: 5000
            });

            if (produtoOrigemResponse.data && produtoOrigemResponse.data.success) {
              produtoPadraoId = produtoOrigemResponse.data.data.produto_padrao_id;
            }
          } catch (error) {
            console.error(`Erro ao buscar produto padrão para produto origem ${necessidade.codigo_origem}:`, error.message);
          }

          // Buscar produto padrão no Foods
          let produtoPadrao = null;
          if (produtoPadraoId) {
            try {
              const foodsApiUrl = process.env.FOODS_API_URL || 'http://localhost:3001';
              const axios = require('axios');
              const produtoGenericoResponse = await axios.get(`${foodsApiUrl}/produto-generico/${produtoPadraoId}`, {
                headers: {
                  'Authorization': req.headers.authorization
                },
                timeout: 5000
              });

              if (produtoGenericoResponse.data && produtoGenericoResponse.data.success) {
                produtoPadrao = produtoGenericoResponse.data.data;
              }
            } catch (error) {
              console.error(`Erro ao buscar produto genérico padrão:`, error.message);
            }
          }

          if (!produtoPadrao) {
            erros++;
            errosDetalhados.push({
              codigo_origem: necessidade.codigo_origem,
              erro: 'Produto padrão não encontrado'
            });
            continue;
          }

          // Criar substituições para cada escola
          for (const escola of necessidade.escolas) {
            const fatorConversao = produtoPadrao.fator_conversao || 1;
            const quantidadeGenerico = Math.ceil(parseFloat(escola.quantidade_origem) / fatorConversao);

            await executeQuery(`
              INSERT INTO necessidades_substituicoes (
                necessidade_id, necessidade_id_grupo,
                produto_origem_id, produto_origem_nome, produto_origem_unidade,
                produto_generico_id, produto_generico_codigo, produto_generico_nome, produto_generico_unidade,
                quantidade_origem, quantidade_generico,
                escola_id, escola_nome,
                semana_abastecimento, semana_consumo,
                usuario_criador_id, status, ativo
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'conf', 1)
            `, [
              escola.necessidade_id,
              escola.necessidade_id, // necessidade_id_grupo usa o mesmo necessidade_id
              necessidade.codigo_origem,
              necessidade.produto_origem_nome,
              necessidade.produto_origem_unidade,
              produtoPadrao.id || produtoPadrao.codigo,
              produtoPadrao.id || produtoPadrao.codigo,
              produtoPadrao.nome,
              produtoPadrao.unidade_medida_sigla || produtoPadrao.unidade || produtoPadrao.unidade_medida || '',
              escola.quantidade_origem,
              quantidadeGenerico,
              escola.escola_id,
              escola.escola_nome,
              necessidade.semana_abastecimento,
              necessidade.semana_consumo,
              usuario_id
            ]);
          }

          sucessos++;
        } catch (error) {
          console.error(`Erro ao iniciar ajustes para ${necessidade.codigo_origem}:`, error);
          erros++;
          errosDetalhados.push({
            codigo_origem: necessidade.codigo_origem,
            erro: error.message
          });
        }
      }

      res.json({
        success: sucessos > 0,
        message: `${sucessos} necessidade(s) processada(s) com sucesso${erros > 0 ? `, ${erros} erro(s)` : ''}`,
        sucessos,
        erros,
        erros_detalhados: errosDetalhados.length > 0 ? errosDetalhados : undefined
      });
    } catch (error) {
      console.error('Erro ao iniciar ajustes:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Erro ao iniciar ajustes'
      });
    }
  }

  /**
   * Liberar para coordenação (mudar status para 'conf')
   */
  static async liberarParaCoordenacao(req, res) {
    try {
      const { substituicao_ids } = req.body;
      const usuario_id = req.user.id;

      if (!substituicao_ids || !Array.isArray(substituicao_ids)) {
        return res.status(400).json({
          success: false,
          message: 'IDs das substituições são obrigatórios'
        });
      }

      // Atualizar status para 'conf'
      const result = await executeQuery(`
        UPDATE necessidades_substituicoes 
        SET 
          status = 'conf',
          data_atualizacao = NOW()
        WHERE id IN (${substituicao_ids.map(() => '?').join(',')})
          AND ativo = 1
      `, substituicao_ids);

      res.json({
        success: true,
        message: `${result.affectedRows} substituição(ões) liberada(s) para coordenação`,
        afetadas: result.affectedRows
      });
    } catch (error) {
      console.error('Erro ao liberar para coordenação:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Erro ao liberar para coordenação'
      });
    }
  }
}

module.exports = SubstituicoesNutricionistaController;

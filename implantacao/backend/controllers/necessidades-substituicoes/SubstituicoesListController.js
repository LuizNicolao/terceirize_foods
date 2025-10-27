const { executeQuery } = require('../../config/database');
const axios = require('axios');

/**
 * Controller para listagem de substituições de necessidades
 * Busca necessidades com status CONF e agrupa por produto origem
 */
class SubstituicoesListController {
  /**
   * Listar necessidades para substituição (status CONF)
   * Agrupa por produto origem e mostra escolas solicitantes
   */
  static async listarParaSubstituicao(req, res) {
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
        // Normalizar formato (remover /25 e parênteses)
        const semanaAbastNormalizada = semana_abastecimento.replace(/[()]/g, '').replace(/\/25$/, '').trim();
        whereConditions.push("n.semana_abastecimento LIKE ?");
        params.push(`%${semanaAbastNormalizada}%`);
      }

      // Filtro por semana de consumo
      if (semana_consumo) {
        // Normalizar formato (remover /25 e parênteses)
        const semanaConsumoNormalizada = semana_consumo.replace(/[()]/g, '').replace(/\/25$/, '').trim();
        whereConditions.push("n.semana_consumo LIKE ?");
        params.push(`%${semanaConsumoNormalizada}%`);
      }

      // Buscar necessidades agrupadas por produto origem
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
        GROUP BY n.produto_id, n.produto, n.produto_unidade, n.semana_abastecimento, n.semana_consumo
        ORDER BY n.produto ASC
      `, params);

      // Buscar substituições existentes para cada produto
      const produtosComSubstituicoes = await Promise.all(
        necessidades.map(async (necessidade) => {
          // Buscar substituições existentes
          const substituicoes = await executeQuery(`
            SELECT 
              ns.id,
              ns.produto_generico_id,
              ns.produto_generico_codigo,
              ns.produto_generico_nome,
              ns.produto_generico_unidade,
              ns.escola_id,
              ns.escola_nome,
              ns.quantidade_generico,
              ns.status,
              ns.necessidade_id
            FROM necessidades_substituicoes ns
            WHERE ns.produto_origem_id = ? 
              AND ns.ativo = 1
              AND ns.status IN ('pendente', 'aprovado')
          `, [necessidade.codigo_origem]);

          // Processar escolas solicitantes
          const escolas = necessidade.escolas_solicitantes
            .split('::')
            .map(escolaStr => {
              const [necessidade_id, escola_id, escola_nome, quantidade] = escolaStr.split('|');
              return {
                necessidade_id: parseInt(necessidade_id),
                escola_id: parseInt(escola_id),
                escola_nome,
                quantidade_origem: parseFloat(quantidade)
              };
            });

          // Verificar quais escolas já têm substituição
          escolas.forEach(escola => {
            const substituicao = substituicoes.find(s => s.escola_id === escola.escola_id);
            escola.substituicao = substituicao || null;
          });

          return {
            ...necessidade,
            escolas,
            substituicoes_existentes: substituicoes.length > 0
          };
        })
      );

      res.json({
        success: true,
        data: produtosComSubstituicoes
      });
    } catch (error) {
      console.error('Erro ao listar necessidades para substituição:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Erro ao listar necessidades para substituição'
      });
    }
  }

  /**
   * Buscar semana de consumo por semana de abastecimento
   */
  static async buscarSemanaConsumo(req, res) {
    try {
      const { semana_abastecimento } = req.query;

      if (!semana_abastecimento) {
        return res.status(400).json({
          success: false,
          message: 'Semana de abastecimento é obrigatória'
        });
      }

      // Normalizar formato (remover /25 e parênteses)
      const semanaAbastNormalizada = semana_abastecimento.replace(/[()]/g, '').replace(/\/25$/, '').trim();

      // Buscar semana de consumo na tabela necessidades
      const result = await executeQuery(`
        SELECT DISTINCT semana_consumo
        FROM necessidades
        WHERE semana_abastecimento LIKE ?
          AND semana_consumo IS NOT NULL
          AND semana_consumo != ''
        LIMIT 1
      `, [`%${semanaAbastNormalizada}%`]);

      if (result.length > 0) {
        res.json({
          success: true,
          data: {
            semana_abastecimento,
            semana_consumo: result[0].semana_consumo
          }
        });
      } else {
        res.json({
          success: false,
          message: 'Semana de consumo não encontrada para esta semana de abastecimento'
        });
      }
    } catch (error) {
      console.error('Erro ao buscar semana de consumo:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Erro ao buscar semana de consumo'
      });
    }
  }

  /**
   * Buscar produtos genéricos do Foods por produto origem
   */
  static async buscarProdutosGenericos(req, res) {
    try {
      const { produto_origem_id, grupo, search } = req.query;
      const foodsApiUrl = process.env.FOODS_API_URL || 'http://localhost:3001';

      // Buscar produtos genéricos vinculados ao produto origem específico
      let url = `${foodsApiUrl}/produto-generico?limit=10000&status=1`;
      
      if (produto_origem_id) {
        url += `&produto_origem_id=${produto_origem_id}`;
      }
      
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }

      const response = await axios.get(url, {
        headers: {
          'Authorization': req.headers.authorization
        },
        timeout: 5000
      });

      // Extrair dados da resposta Foods (estrutura HATEOAS)
      let produtosGenericos = [];
      
      if (response.data) {
        // Verificar estrutura HATEOAS
        if (response.data.data && response.data.data.items) {
          produtosGenericos = response.data.data.items;
        } else if (response.data.data) {
          produtosGenericos = Array.isArray(response.data.data) ? response.data.data : [];
        } else if (Array.isArray(response.data)) {
          produtosGenericos = response.data;
        }
      }

      res.json({
        success: true,
        data: produtosGenericos
      });
    } catch (error) {
      console.error('[Substituições] Erro ao buscar produtos genéricos:', error.message);
      console.error('[Substituições] Stack:', error.stack);
      res.json({
        success: true,
        data: []
      });
    }
  }
}

module.exports = SubstituicoesListController;

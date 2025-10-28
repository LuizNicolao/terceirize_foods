const { executeQuery } = require('../../config/database');

/**
 * Controller para substituições da coordenação
 * Status: 'conf' (aprovação e edição final)
 */
class SubstituicoesCoordenacaoController {
  /**
   * Listar necessidades para coordenação (status 'conf')
   */
  static async listarParaCoordenacao(req, res) {
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

      // Buscar necessidades agrupadas por produto origem + produto genérico (com substituições)
      const necessidades = await executeQuery(`
        SELECT 
          n.produto_id as codigo_origem,
          n.produto as produto_origem_nome,
          n.produto_unidade as produto_origem_unidade,
          COALESCE(ns.produto_generico_id, '') as produto_generico_id,
          COALESCE(ns.produto_generico_codigo, '') as produto_generico_codigo,
          COALESCE(ns.produto_generico_nome, '') as produto_generico_nome,
          COALESCE(ns.produto_generico_unidade, '') as produto_generico_unidade,
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
        LEFT JOIN necessidades_substituicoes ns ON (
          ns.produto_origem_id = n.produto_id 
          AND ns.ativo = 1 
          AND ns.status = 'conf'
        )
        WHERE ${whereConditions.join(' AND ')}
          AND ns.id IS NOT NULL
        GROUP BY n.produto_id, n.produto, n.produto_unidade, n.semana_abastecimento, n.semana_consumo, 
                 COALESCE(ns.produto_generico_id, ''), COALESCE(ns.produto_generico_codigo, ''), 
                 COALESCE(ns.produto_generico_nome, ''), COALESCE(ns.produto_generico_unidade, '')
        ORDER BY n.produto ASC, COALESCE(ns.produto_generico_nome, '') ASC
      `, params);

      // Buscar substituições existentes para cada produto
      const produtosComSubstituicoes = await Promise.all(
        necessidades.map(async (necessidade) => {
          // Buscar substituições existentes para este produto genérico específico
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
              AND ns.produto_generico_id = ?
              AND ns.ativo = 1
              AND ns.status = 'conf'
          `, [necessidade.codigo_origem, necessidade.produto_generico_id]);

          // Processar escolas solicitantes
          let escolas = necessidade.escolas_solicitantes
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

          // Se há produto genérico específico, filtrar apenas escolas que usam esse produto
          if (necessidade.produto_generico_id) {
            const escolasComSubstituicao = substituicoes.map(s => s.escola_id);
            escolas = escolas.filter(escola => escolasComSubstituicao.includes(escola.escola_id));
          }

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
      console.error('Erro ao listar necessidades para coordenação:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Erro ao listar necessidades para coordenação'
      });
    }
  }

  /**
   * Aprovar substituição
   */
  static async aprovarSubstituicao(req, res) {
    try {
      const { id } = req.params;
      const usuario_id = req.user.id;

      const result = await executeQuery(`
        UPDATE necessidades_substituicoes 
        SET 
          status = 'aprovado',
          usuario_aprovador_id = ?,
          data_aprovacao = NOW(),
          data_atualizacao = NOW()
        WHERE id = ? AND ativo = 1
      `, [usuario_id, id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Substituição não encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Substituição aprovada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao aprovar substituição:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Erro ao aprovar substituição'
      });
    }
  }

  /**
   * Rejeitar substituição
   */
  static async rejeitarSubstituicao(req, res) {
    try {
      const { id } = req.params;
      const usuario_id = req.user.id;

      const result = await executeQuery(`
        UPDATE necessidades_substituicoes 
        SET 
          status = 'rejeitado',
          usuario_aprovador_id = ?,
          data_aprovacao = NOW(),
          data_atualizacao = NOW()
        WHERE id = ? AND ativo = 1
      `, [usuario_id, id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Substituição não encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Substituição rejeitada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao rejeitar substituição:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Erro ao rejeitar substituição'
      });
    }
  }

  /**
   * Aprovar todas as substituições
   */
  static async aprovarTodas(req, res) {
    try {
      const { substituicao_ids } = req.body;
      const usuario_id = req.user.id;

      if (!substituicao_ids || !Array.isArray(substituicao_ids)) {
        return res.status(400).json({
          success: false,
          message: 'IDs das substituições são obrigatórios'
        });
      }

      // Aprovar todas as substituições
      const result = await executeQuery(`
        UPDATE necessidades_substituicoes 
        SET 
          status = 'aprovado',
          usuario_aprovador_id = ?,
          data_aprovacao = NOW(),
          data_atualizacao = NOW()
        WHERE id IN (${substituicao_ids.map(() => '?').join(',')})
          AND ativo = 1
          AND status = 'conf'
      `, [usuario_id, ...substituicao_ids]);

      res.json({
        success: true,
        message: `${result.affectedRows} substituição(ões) aprovada(s) com sucesso`,
        aprovadas: result.affectedRows
      });
    } catch (error) {
      console.error('Erro ao aprovar todas as substituições:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Erro ao aprovar todas as substituições'
      });
    }
  }
}

module.exports = SubstituicoesCoordenacaoController;

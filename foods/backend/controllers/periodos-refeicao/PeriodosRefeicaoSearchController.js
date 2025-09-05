/**
 * Controller de Busca para Períodos de Refeição
 * Implementa operações de busca específicas
 */

const { executeQuery } = require('../../config/database');

class PeriodosRefeicaoSearchController {
  // Buscar períodos de refeição ativos
  static async buscarAtivos(req, res) {
    try {
      const { filial_id } = req.query;
      
      let query = `
        SELECT 
          pr.id,
          pr.nome,
          pr.codigo,
          pr.descricao
        FROM periodos_refeicao pr
        WHERE pr.status = 'ativo'`;

      const params = [];

      if (filial_id) {
        query += ` AND pr.id IN (
          SELECT prf.periodo_refeicao_id 
          FROM periodos_refeicao_filiais prf 
          WHERE prf.filial_id = ?
        )`;
        params.push(filial_id);
      }

      query += ` ORDER BY pr.nome ASC`;

      const periodos = await executeQuery(query, params);

      res.json({
        success: true,
        data: periodos
      });
    } catch (error) {
      console.error('Erro ao buscar períodos de refeição ativos:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar os períodos de refeição ativos'
      });
    }
  }

  // Buscar períodos de refeição por filial
  static async buscarPorFilial(req, res) {
    try {
      const { filialId } = req.params;

      const query = `
        SELECT 
          pr.id,
          pr.nome,
          pr.codigo,
          pr.descricao,
          pr.status
        FROM periodos_refeicao pr
        INNER JOIN periodos_refeicao_filiais prf ON pr.id = prf.periodo_refeicao_id
        WHERE prf.filial_id = ? AND pr.status = 'ativo'
        ORDER BY pr.nome ASC`;

      const periodos = await executeQuery(query, [filialId]);

      res.json({
        success: true,
        data: periodos
      });
    } catch (error) {
      console.error('Erro ao buscar períodos de refeição por filial:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar os períodos de refeição da filial'
      });
    }
  }

  // Buscar períodos de refeição disponíveis para uma unidade escolar
  static async buscarDisponiveisParaUnidade(req, res) {
    try {
      const { unidadeEscolarId } = req.params;

      // Primeiro, buscar a filial da unidade escolar
      const unidadeQuery = 'SELECT filial_id FROM unidades_escolares WHERE id = ?';
      const unidades = await executeQuery(unidadeQuery, [unidadeEscolarId]);

      if (unidades.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Unidade escolar não encontrada'
        });
      }

      const filialId = unidades[0].filial_id;

      // Buscar períodos disponíveis para a filial que não estão vinculados à unidade
      const query = `
        SELECT 
          pr.id,
          pr.nome,
          pr.codigo,
          pr.descricao
        FROM periodos_refeicao pr
        INNER JOIN periodos_refeicao_filiais prf ON pr.id = prf.periodo_refeicao_id
        WHERE prf.filial_id = ? 
          AND pr.status = 'ativo'
          AND pr.id NOT IN (
            SELECT periodo_refeicao_id 
            FROM unidades_escolares_periodos_refeicao 
            WHERE unidade_escolar_id = ?
          )
        ORDER BY pr.nome ASC`;

      const periodos = await executeQuery(query, [filialId, unidadeEscolarId]);

      res.json({
        success: true,
        data: periodos
      });
    } catch (error) {
      console.error('Erro ao buscar períodos disponíveis para unidade:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar os períodos disponíveis'
      });
    }
  }

  // Buscar períodos de refeição por IDs específicos
  static async buscarPorIds(req, res) {
    try {
      const { ids } = req.body;

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'IDs são obrigatórios'
        });
      }

      const placeholders = ids.map(() => '?').join(',');
      const query = `
        SELECT 
          pr.id,
          pr.nome,
          pr.codigo,
          pr.descricao,
          pr.status
        FROM periodos_refeicao pr
        WHERE pr.id IN (${placeholders})
        ORDER BY pr.nome ASC`;

      const periodos = await executeQuery(query, ids);

      res.json({
        success: true,
        data: periodos
      });
    } catch (error) {
      console.error('Erro ao buscar períodos por IDs:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar os períodos de refeição'
      });
    }
  }
}

module.exports = PeriodosRefeicaoSearchController;

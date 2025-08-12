/**
 * Controller de Estatísticas de Unidades Escolares
 * Responsável por relatórios e estatísticas
 */

const { executeQuery } = require('../../config/database');

class UnidadesEscolaresStatsController {
  // Buscar estatísticas totais das unidades escolares
  static async buscarEstatisticas(req, res) {
    try {
      // Query para buscar estatísticas totais
      const statsQuery = `
        SELECT 
          COUNT(*) as total_unidades,
          SUM(CASE WHEN status = 'ativo' THEN 1 ELSE 0 END) as unidades_ativas,
          COUNT(DISTINCT estado) as total_estados,
          COUNT(DISTINCT cidade) as total_cidades
        FROM unidades_escolares
      `;
      
      const statsResult = await executeQuery(statsQuery);
      const estatisticas = statsResult[0];

      res.json({
        success: true,
        data: estatisticas
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar as estatísticas'
      });
    }
  }
}

module.exports = UnidadesEscolaresStatsController;

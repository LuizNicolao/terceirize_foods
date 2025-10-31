/**
 * Controller de Estatísticas de Rotas
 * Responsável por relatórios e estatísticas
 */

const { executeQuery } = require('../../config/database');

class RotasStatsController {
  // Buscar estatísticas das rotas
  static async buscarEstatisticasRotas(req, res) {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_rotas,
          COUNT(CASE WHEN status = 'ativo' THEN 1 END) as rotas_ativas,
          COUNT(CASE WHEN status = 'inativo' THEN 1 END) as rotas_inativas,
          COUNT(CASE WHEN frequencia_entrega = 'semanal' THEN 1 END) as rotas_semanais,
          COUNT(CASE WHEN frequencia_entrega = 'quinzenal' THEN 1 END) as rotas_quinzenais,
          COUNT(CASE WHEN frequencia_entrega = 'mensal' THEN 1 END) as rotas_mensais,
          COUNT(CASE WHEN frequencia_entrega = 'transferencia' THEN 1 END) as rotas_transferencia,
          COUNT(DISTINCT filial_id) as total_filiais
        FROM rotas
      `;

      const estatisticas = await executeQuery(query);

      res.json({
        success: true,
        data: estatisticas[0]
      });

    } catch (error) {
      console.error('Erro ao buscar estatísticas das rotas:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar as estatísticas das rotas'
      });
    }
  }
}

module.exports = RotasStatsController;

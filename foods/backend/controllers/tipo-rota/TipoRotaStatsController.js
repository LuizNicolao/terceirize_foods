/**
 * Controller de Estatísticas de Tipo de Rota
 * Responsável por relatórios e estatísticas
 */

const { executeQuery } = require('../../config/database');

class TipoRotaStatsController {
  // Buscar estatísticas dos tipos de rota
  static async buscarEstatisticasTipoRotas(req, res) {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_tipo_rotas,
          COUNT(CASE WHEN status = 'ativo' THEN 1 END) as tipo_rotas_ativas,
          COUNT(CASE WHEN status = 'inativo' THEN 1 END) as tipo_rotas_inativas,
          COUNT(DISTINCT filial_id) as total_filiais,
          COUNT(DISTINCT grupo_id) as total_grupos,
          (SELECT COUNT(*) FROM unidades_escolares WHERE tipo_rota_id IS NOT NULL AND status = 'ativo') as total_unidades_vinculadas
        FROM tipo_rota
      `;

      const estatisticas = await executeQuery(query);

      res.json({
        success: true,
        data: estatisticas[0]
      });

    } catch (error) {
      console.error('Erro ao buscar estatísticas dos tipos de rota:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar as estatísticas dos tipos de rota'
      });
    }
  }
}

module.exports = TipoRotaStatsController;


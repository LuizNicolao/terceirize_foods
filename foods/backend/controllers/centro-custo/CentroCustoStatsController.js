/**
 * Controller de Estatísticas de Centro de Custo
 * Responsável por relatórios e estatísticas
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class CentroCustoStatsController {
  
  /**
   * Buscar estatísticas gerais de centros de custo
   */
  static buscarEstatisticas = asyncHandler(async (req, res) => {
    // Estatísticas gerais
    const totalCentrosCusto = await executeQuery(
      'SELECT COUNT(*) as total FROM centro_custo'
    );

    const centrosCustoAtivos = await executeQuery(
      'SELECT COUNT(*) as total FROM centro_custo WHERE status = 1'
    );

    const centrosCustoInativos = await executeQuery(
      'SELECT COUNT(*) as total FROM centro_custo WHERE status = 0'
    );

    // Centros de custo por filial
    const centrosCustoPorFilial = await executeQuery(`
      SELECT 
        f.id as filial_id,
        f.filial as filial_nome,
        f.codigo_filial,
        COUNT(cc.id) as total_centros_custo,
        SUM(CASE WHEN cc.status = 1 THEN 1 ELSE 0 END) as ativos,
        SUM(CASE WHEN cc.status = 0 THEN 1 ELSE 0 END) as inativos
      FROM filiais f
      LEFT JOIN centro_custo cc ON f.id = cc.filial_id
      GROUP BY f.id, f.filial, f.codigo_filial
      ORDER BY f.filial ASC
    `);

    // Filiais sem centro de custo
    const filiaisSemCentroCusto = await executeQuery(`
      SELECT 
        f.id,
        f.filial,
        f.codigo_filial
      FROM filiais f
      LEFT JOIN centro_custo cc ON f.id = cc.filial_id AND cc.status = 1
      WHERE f.status = 1 AND cc.id IS NULL
      ORDER BY f.filial ASC
    `);

    const estatisticas = {
      geral: {
        total_centros_custo: totalCentrosCusto[0].total,
        centros_custo_ativos: centrosCustoAtivos[0].total,
        centros_custo_inativos: centrosCustoInativos[0].total
      },
      por_filial: centrosCustoPorFilial,
      filiais_sem_centro_custo: filiaisSemCentroCusto
    };

    return successResponse(res, estatisticas, 'Estatísticas de centros de custo obtidas com sucesso', STATUS_CODES.OK);
  });
}

module.exports = CentroCustoStatsController;


/**
 * Controller de Estatísticas de Almoxarifado
 * Responsável por relatórios e estatísticas
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class AlmoxarifadoStatsController {
  
  /**
   * Buscar estatísticas gerais de almoxarifados
   */
  static buscarEstatisticas = asyncHandler(async (req, res) => {
    // Estatísticas gerais
    const totalAlmoxarifados = await executeQuery(
      'SELECT COUNT(*) as total FROM almoxarifado'
    );

    const almoxarifadosAtivos = await executeQuery(
      'SELECT COUNT(*) as total FROM almoxarifado WHERE status = 1'
    );

    const almoxarifadosInativos = await executeQuery(
      'SELECT COUNT(*) as total FROM almoxarifado WHERE status = 0'
    );

    // Almoxarifados por filial
    const almoxarifadosPorFilial = await executeQuery(`
      SELECT 
        f.id as filial_id,
        f.filial as filial_nome,
        f.codigo_filial,
        COUNT(a.id) as total_almoxarifados,
        SUM(CASE WHEN a.status = 1 THEN 1 ELSE 0 END) as ativos,
        SUM(CASE WHEN a.status = 0 THEN 1 ELSE 0 END) as inativos
      FROM filiais f
      LEFT JOIN almoxarifado a ON f.id = a.filial_id
      GROUP BY f.id, f.filial, f.codigo_filial
      ORDER BY f.filial ASC
    `);

    // Almoxarifados por centro de custo
    const almoxarifadosPorCentroCusto = await executeQuery(`
      SELECT 
        cc.id as centro_custo_id,
        cc.codigo as centro_custo_codigo,
        cc.nome as centro_custo_nome,
        COUNT(a.id) as total_almoxarifados,
        SUM(CASE WHEN a.status = 1 THEN 1 ELSE 0 END) as ativos,
        SUM(CASE WHEN a.status = 0 THEN 1 ELSE 0 END) as inativos
      FROM centro_custo cc
      LEFT JOIN almoxarifado a ON cc.id = a.centro_custo_id
      GROUP BY cc.id, cc.codigo, cc.nome
      ORDER BY cc.nome ASC
    `);

    const estatisticas = {
      geral: {
        total_almoxarifados: totalAlmoxarifados[0].total,
        almoxarifados_ativos: almoxarifadosAtivos[0].total,
        almoxarifados_inativos: almoxarifadosInativos[0].total
      },
      por_filial: almoxarifadosPorFilial,
      por_centro_custo: almoxarifadosPorCentroCusto
    };

    return successResponse(res, estatisticas, 'Estatísticas de almoxarifados obtidas com sucesso', STATUS_CODES.OK);
  });
}

module.exports = AlmoxarifadoStatsController;


/**
 * Controller de Estatísticas de Produto Comercial
 * Responsável por operações de estatísticas e relatórios
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  errorResponse,
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class ProdutoComercialStatsController {
  
  /**
   * Estatísticas gerais
   */
  static estatisticasGerais = asyncHandler(async (req, res) => {
    const stats = await executeQuery(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as ativos,
        SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) as inativos,
        COUNT(DISTINCT grupo_id) as total_grupos,
        COUNT(DISTINCT subgrupo_id) as total_subgrupos,
        COUNT(DISTINCT classe_id) as total_classes,
        COUNT(DISTINCT unidade_medida_id) as total_unidades_medida
      FROM produto_comercial
    `);

    successResponse(res, stats[0]);
  });
}

module.exports = ProdutoComercialStatsController;


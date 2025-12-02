/**
 * Controller de Estatísticas para Ficha Homologação
 * Responsável por operações de estatísticas
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  errorResponse,
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class FichaHomologacaoStatsController {
  
  /**
   * Buscar estatísticas de fichas de homologação
   */
  static buscarEstatisticas = asyncHandler(async (req, res) => {
    const statsQuery = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'ativo' THEN 1 ELSE 0 END) as ativas,
        SUM(CASE WHEN status = 'inativo' THEN 1 ELSE 0 END) as inativas,
        SUM(CASE WHEN tipo = 'NOVO_PRODUTO' THEN 1 ELSE 0 END) as novos_produtos,
        SUM(CASE WHEN tipo = 'REAVALIACAO' THEN 1 ELSE 0 END) as reavaliacoes,
        SUM(CASE WHEN peso = 'BOM' THEN 1 ELSE 0 END) as peso_bom,
        SUM(CASE WHEN peso = 'REGULAR' THEN 1 ELSE 0 END) as peso_regular,
        SUM(CASE WHEN peso = 'RUIM' THEN 1 ELSE 0 END) as peso_ruim,
        SUM(CASE WHEN cor = 'BOM' THEN 1 ELSE 0 END) as cor_bom,
        SUM(CASE WHEN sabor = 'BOM' THEN 1 ELSE 0 END) as sabor_bom,
        SUM(CASE WHEN aparencia = 'BOM' THEN 1 ELSE 0 END) as aparencia_bom
      FROM ficha_homologacao
    `;
    
    const stats = await executeQuery(statsQuery);

    successResponse(res, stats[0], 'Estatísticas encontradas');
  });
}

module.exports = FichaHomologacaoStatsController;


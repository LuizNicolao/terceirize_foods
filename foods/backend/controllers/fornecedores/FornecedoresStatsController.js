/**
 * Controller de Estatísticas de Fornecedores
 * Responsável por relatórios e estatísticas
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class FornecedoresStatsController {
  
  /**
   * Buscar estatísticas totais dos fornecedores
   */
  static buscarEstatisticas = asyncHandler(async (req, res) => {
    // Query para buscar estatísticas totais
    const statsQuery = `
      SELECT 
        COUNT(*) as total_fornecedores,
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as fornecedores_ativos,
        SUM(CASE WHEN email IS NOT NULL AND email != '' THEN 1 ELSE 0 END) as com_email,
        SUM(CASE WHEN telefone IS NOT NULL AND telefone != '' THEN 1 ELSE 0 END) as com_telefone
      FROM fornecedores
    `;
    
    const statsResult = await executeQuery(statsQuery);
    const estatisticas = statsResult[0];

    return successResponse(res, estatisticas, 'Estatísticas carregadas com sucesso', STATUS_CODES.OK);
  });
}

module.exports = FornecedoresStatsController;

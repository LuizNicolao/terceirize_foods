/**
 * Controller de Estatísticas de Clientes
 * Responsável por relatórios e estatísticas
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class ClientesStatsController {
  
  /**
   * Buscar estatísticas totais dos clientes
   */
  static buscarEstatisticas = asyncHandler(async (req, res) => {
    // Query para buscar estatísticas totais
    const statsQuery = `
      SELECT 
        COUNT(*) as total_clientes,
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as clientes_ativos,
        SUM(CASE WHEN email IS NOT NULL AND email != '' THEN 1 ELSE 0 END) as com_email,
        SUM(CASE WHEN telefone IS NOT NULL AND telefone != '' THEN 1 ELSE 0 END) as com_telefone
      FROM clientes
    `;
    
    const statsResult = await executeQuery(statsQuery);
    const estatisticas = statsResult[0];

    return successResponse(res, estatisticas, 'Estatísticas carregadas com sucesso', STATUS_CODES.OK);
  });
}

module.exports = ClientesStatsController;

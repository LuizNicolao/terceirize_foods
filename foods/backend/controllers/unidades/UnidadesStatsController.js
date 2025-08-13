/**
 * Controller de Estatísticas de Unidades de Medida
 * Responsável por funcionalidades de estatísticas e relatórios
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class UnidadesStatsController {
  
  /**
   * Buscar unidades mais utilizadas
   */
  static buscarUnidadesMaisUtilizadas = asyncHandler(async (req, res) => {
    const { limit = 10 } = req.query;

    const query = `
      SELECT 
        u.id, u.nome, u.sigla, u.status,
        COUNT(p.id) as total_produtos
      FROM unidades_medida u
      LEFT JOIN produtos p ON u.id = p.unidade_id
      WHERE u.status = 1
      GROUP BY u.id, u.nome, u.sigla, u.status
      ORDER BY total_produtos DESC, u.nome ASC
      LIMIT ?
    `;

    const unidades = await executeQuery(query, [parseInt(limit)]);

    // Retornar resposta no formato esperado pelo frontend
    return successResponse(res, unidades, 'Unidades mais utilizadas listadas com sucesso', STATUS_CODES.OK, {
      _links: res.addListLinks(unidades)._links
    });
  });
}

module.exports = UnidadesStatsController;

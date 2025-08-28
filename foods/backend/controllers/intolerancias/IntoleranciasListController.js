const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  notFoundResponse, 
  errorResponse,
  asyncHandler 
} = require('../../middleware/responseHandler');

class IntoleranciasListController {
  /**
   * Lista todas as intolerâncias com paginação e filtros
   */
  static listarIntolerancias = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, search = '', status = '' } = req.query;
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const offset = (pageNum - 1) * limitNum;

    let whereClause = 'WHERE 1=1';
    const params = [];

    // Filtro de busca por nome
    if (search) {
      whereClause += ' AND nome LIKE ?';
      params.push(`%${search}%`);
    }

    // Filtro por status
    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }

    // Query para contar total de registros
    const countQuery = `SELECT COUNT(*) as total FROM intolerancias ${whereClause}`;
    const countResult = await executeQuery(countQuery, params);
    const totalItems = countResult[0].total;

    // Query principal com paginação
    const query = `
      SELECT 
        id,
        nome,
        status,
        criado_em,
        atualizado_em
      FROM intolerancias 
      ${whereClause}
      ORDER BY nome ASC
      LIMIT ? OFFSET ?
    `;

    const intolerancias = await executeQuery(query, [...params, limitNum, offset]);

    const totalPages = Math.ceil(totalItems / limitNum);

    const response = {
      data: intolerancias,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems,
        itemsPerPage: limitNum
      }
    };

    return successResponse(res, response, 'Intolerâncias listadas com sucesso');
  });

  /**
   * Busca uma intolerância específica por ID
   */
  static buscarIntoleranciaPorId = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const query = `
      SELECT 
        id,
        nome,
        status,
        criado_em,
        atualizado_em
      FROM intolerancias 
      WHERE id = ?
    `;

    const intolerancias = await executeQuery(query, [id]);

    if (intolerancias.length === 0) {
      return notFoundResponse(res, 'Intolerância não encontrada');
    }

    return successResponse(res, intolerancias[0], 'Intolerância encontrada com sucesso');
  });

  /**
   * Lista todas as intolerâncias ativas
   */
  static listarIntoleranciasAtivas = asyncHandler(async (req, res) => {
    const query = `
      SELECT 
        id,
        nome,
        status
      FROM intolerancias 
      WHERE status = 'ativo'
      ORDER BY nome ASC
    `;

    const intolerancias = await executeQuery(query);

    return successResponse(res, intolerancias, 'Intolerâncias ativas listadas com sucesso');
  });
}

module.exports = IntoleranciasListController;

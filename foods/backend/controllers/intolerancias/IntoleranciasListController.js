const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  notFoundResponse, 
  errorResponse 
} = require('../../middleware/responseHandler');

class IntoleranciasListController {
  /**
   * Lista todas as intolerâncias com paginação e filtros
   */
  static async listarIntolerancias(req, res) {
    try {
      const { page = 1, limit = 10, search = '', status = '' } = req.query;
      const offset = (page - 1) * limit;

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
      const [countResult] = await executeQuery(countQuery, params);
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

      const [intolerancias] = await executeQuery(query, [...params, parseInt(limit), offset]);

      const totalPages = Math.ceil(totalItems / limit);

      const response = {
        data: intolerancias,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems,
          itemsPerPage: parseInt(limit)
        }
      };

      return successResponse(res, response, 'Intolerâncias listadas com sucesso');
    } catch (error) {
      console.error('Erro ao listar intolerâncias:', error);
      return errorResponse(res, 'Erro interno do servidor');
    }
  }

  /**
   * Busca uma intolerância específica por ID
   */
  static async buscarIntoleranciaPorId(req, res) {
    try {
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

      const [intolerancias] = await executeQuery(query, [id]);

      if (intolerancias.length === 0) {
        return notFoundResponse(res, 'Intolerância não encontrada');
      }

      return successResponse(res, intolerancias[0], 'Intolerância encontrada com sucesso');
    } catch (error) {
      console.error('Erro ao buscar intolerância:', error);
      return errorResponse(res, 'Erro interno do servidor');
    }
  }

  /**
   * Lista todas as intolerâncias ativas
   */
  static async listarIntoleranciasAtivas(req, res) {
    try {
      const query = `
        SELECT 
          id,
          nome,
          status
        FROM intolerancias 
        WHERE status = 'ativo'
        ORDER BY nome ASC
      `;

      const [intolerancias] = await executeQuery(query);

      return successResponse(res, intolerancias, 'Intolerâncias ativas listadas com sucesso');
    } catch (error) {
      console.error('Erro ao listar intolerâncias ativas:', error);
      return errorResponse(res, 'Erro interno do servidor');
    }
  }
}

module.exports = IntoleranciasListController;

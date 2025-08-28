const db = require('../../config/database');
const { formatResponse } = require('../../utils/formatters');

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
      const [countResult] = await db.execute(countQuery, params);
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

      const [intolerancias] = await db.execute(query, [...params, parseInt(limit), offset]);

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

      res.json(formatResponse(response, 'Intolerâncias listadas com sucesso'));
    } catch (error) {
      console.error('Erro ao listar intolerâncias:', error);
      res.status(500).json(formatResponse(null, 'Erro interno do servidor', false));
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

      const [intolerancias] = await db.execute(query, [id]);

      if (intolerancias.length === 0) {
        return res.status(404).json(formatResponse(null, 'Intolerância não encontrada', false));
      }

      res.json(formatResponse(intolerancias[0], 'Intolerância encontrada com sucesso'));
    } catch (error) {
      console.error('Erro ao buscar intolerância:', error);
      res.status(500).json(formatResponse(null, 'Erro interno do servidor', false));
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

      const [intolerancias] = await db.execute(query);

      res.json(formatResponse(intolerancias, 'Intolerâncias ativas listadas com sucesso'));
    } catch (error) {
      console.error('Erro ao listar intolerâncias ativas:', error);
      res.status(500).json(formatResponse(null, 'Erro interno do servidor', false));
    }
  }
}

module.exports = IntoleranciasListController;

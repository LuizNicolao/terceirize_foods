const { executeQuery } = require('../../config/database');
const { buildPaginationQuery, buildSearchQuery } = require('../../utils/queryBuilder');

class IntoleranciasListController {
  static async listarIntolerancias(req, res) {
    try {
      const { page = 1, limit = 20, search, status } = req.query;
      const offset = (page - 1) * limit;

      // Construir query base
      let baseQuery = 'FROM intolerancias WHERE 1=1';
      const queryParams = [];

      // Adicionar filtros
      if (search) {
        baseQuery += ' AND (nome LIKE ?)';
        queryParams.push(`%${search}%`);
      }

      if (status && status !== 'todos') {
        baseQuery += ' AND status = ?';
        queryParams.push(status);
      }

      // Query para contar total
      const countQuery = `SELECT COUNT(*) as total ${baseQuery}`;
      const [countResult] = await executeQuery(countQuery, queryParams);
      const totalItems = countResult.total;

      // Query para buscar dados
      const dataQuery = `
        SELECT 
          id,
          nome,
          status,
          criado_em,
          atualizado_em
        ${baseQuery}
        ORDER BY nome ASC
        LIMIT ? OFFSET ?
      `;

      const dataParams = [...queryParams, parseInt(limit), offset];
      const intolerancias = await executeQuery(dataQuery, dataParams);

      // Calcular paginação
      const totalPages = Math.ceil(totalItems / limit);
      const currentPage = parseInt(page);

      // Adicionar links HATEOAS
      const intoleranciasComLinks = intolerancias.map(intolerancia => ({
        ...intolerancia,
        links: [
          { rel: 'self', href: `/intolerancias/${intolerancia.id}`, method: 'GET' },
          { rel: 'update', href: `/intolerancias/${intolerancia.id}`, method: 'PUT' },
          { rel: 'delete', href: `/intolerancias/${intolerancia.id}`, method: 'DELETE' }
        ]
      }));

      res.json({
        success: true,
        data: intoleranciasComLinks,
        pagination: {
          currentPage,
          totalPages,
          totalItems,
          itemsPerPage: parseInt(limit),
          hasNextPage: currentPage < totalPages,
          hasPrevPage: currentPage > 1
        }
      });
    } catch (error) {
      console.error('Erro ao listar intolerâncias:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

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

      const [intolerancia] = await executeQuery(query, [id]);

      if (!intolerancia) {
        return res.status(404).json({
          success: false,
          message: 'Intolerância não encontrada'
        });
      }

      // Adicionar links HATEOAS
      intolerancia.links = [
        { rel: 'self', href: `/intolerancias/${intolerancia.id}`, method: 'GET' },
        { rel: 'update', href: `/intolerancias/${intolerancia.id}`, method: 'PUT' },
        { rel: 'delete', href: `/intolerancias/${intolerancia.id}`, method: 'DELETE' }
      ];

      res.json({
        success: true,
        data: intolerancia
      });
    } catch (error) {
      console.error('Erro ao buscar intolerância:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  static async buscarIntoleranciasAtivas(req, res) {
    try {
      const query = `
        SELECT 
          id,
          nome,
          status,
          criado_em,
          atualizado_em
        FROM intolerancias 
        WHERE status = 'ativo'
        ORDER BY nome ASC
      `;

      const intolerancias = await executeQuery(query);

      // Adicionar links HATEOAS
      const intoleranciasComLinks = intolerancias.map(intolerancia => ({
        ...intolerancia,
        links: [
          { rel: 'self', href: `/intolerancias/${intolerancia.id}`, method: 'GET' },
          { rel: 'update', href: `/intolerancias/${intolerancia.id}`, method: 'PUT' },
          { rel: 'delete', href: `/intolerancias/${intolerancia.id}`, method: 'DELETE' }
        ]
      }));

      res.json({
        success: true,
        data: intoleranciasComLinks
      });
    } catch (error) {
      console.error('Erro ao buscar intolerâncias ativas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = IntoleranciasListController;

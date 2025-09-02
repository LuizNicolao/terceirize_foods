const { executeQuery } = require('../../config/database');

class IntoleranciasListController {
  static async listarIntolerancias(req, res) {
    try {
      const { search, status } = req.query;
      const pagination = req.pagination;

      // Query base com contagem de unidades escolares
      let baseQuery = `
        SELECT 
          i.id,
          i.nome,
          i.status,
          i.criado_em,
          i.atualizado_em,
          COUNT(DISTINCT e.unidade_escolar_id) as unidades_escolares_count
        FROM intolerancias i
        LEFT JOIN efetivos e ON i.id = e.intolerancia_id
        WHERE 1=1
      `;
      
      let params = [];

      // Aplicar filtros
      if (search) {
        baseQuery += ' AND (i.nome LIKE ?)';
        params.push(`%${search}%`);
      }

      if (status && status !== 'todos') {
        baseQuery += ' AND i.status = ?';
        params.push(status);
      }

      baseQuery += ' GROUP BY i.id, i.nome, i.status, i.criado_em, i.atualizado_em';
      baseQuery += ' ORDER BY i.nome ASC';

      // Aplicar paginação manualmente
      const limit = pagination.limit;
      const offset = pagination.offset;
      const query = `${baseQuery} LIMIT ${limit} OFFSET ${offset}`;
      
      // Executar query paginada
      const intolerancias = await executeQuery(query, params);

      // Contar total de registros
      let countQuery = 'SELECT COUNT(*) as total FROM intolerancias WHERE 1=1';
      let countParams = [];
      
      if (search) {
        countQuery += ' AND (nome LIKE ?)';
        countParams.push(`%${search}%`);
      }
      
      if (status && status !== 'todos') {
        countQuery += ' AND status = ?';
        countParams.push(status);
      }
      
      const totalResult = await executeQuery(countQuery, countParams);
      const totalItems = totalResult[0].total;

      // Gerar metadados de paginação
      const queryParams = { ...req.query };
      delete queryParams.page;
      delete queryParams.limit;
      
      const meta = pagination.generateMeta(totalItems, '/api/intolerancias', queryParams);

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
        pagination: meta
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
          i.id,
          i.nome,
          i.status,
          i.criado_em,
          i.atualizado_em,
          COUNT(DISTINCT e.unidade_escolar_id) as unidades_escolares_count
        FROM intolerancias i
        LEFT JOIN efetivos e ON i.id = e.intolerancia_id
        WHERE i.id = ?
        GROUP BY i.id, i.nome, i.status, i.criado_em, i.atualizado_em
      `;

      const [intolerancia] = await executeQuery(query, [parseInt(id)]);

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
          i.id,
          i.nome,
          i.status,
          i.criado_em,
          i.atualizado_em,
          COUNT(DISTINCT e.unidade_escolar_id) as unidades_escolares_count
        FROM intolerancias i
        LEFT JOIN efetivos e ON i.id = e.intolerancia_id
        WHERE i.status = 'ativo'
        GROUP BY i.id, i.nome, i.status, i.criado_em, i.atualizado_em
        ORDER BY i.nome ASC
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

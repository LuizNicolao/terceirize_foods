const { executeQuery } = require('../../config/database');

class EfetivosListController {


  static async listarEfetivos(req, res) {
    try {
      const { unidade_escolar_id } = req.params;
      const { search, status } = req.query;
      const pagination = req.pagination;

      // Query base
      let baseQuery = `
        SELECT 
          e.id,
          e.unidade_escolar_id,
          e.tipo_efetivo,
          e.quantidade,
          e.intolerancia_id,
          e.criado_em,
          e.atualizado_em,
          i.nome as intolerancia_nome
        FROM efetivos e
        LEFT JOIN intolerancias i ON e.intolerancia_id = i.id
        WHERE e.unidade_escolar_id = ?
      `;
      
      let params = [unidade_escolar_id];

      // Aplicar filtros
      if (search) {
        baseQuery += ' AND (e.tipo_efetivo LIKE ? OR i.nome LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
      }

      if (status && status !== 'todos') {
        baseQuery += ' AND e.tipo_efetivo = ?';
        params.push(status);
      }

      baseQuery += ' ORDER BY e.tipo_efetivo ASC, i.nome ASC';

      // Aplicar paginação manualmente
      const limit = pagination.limit;
      const offset = pagination.offset;
      const query = `${baseQuery} LIMIT ${limit} OFFSET ${offset}`;
      
      // Executar query paginada
      const efetivos = await executeQuery(query, params);

      // Contar total de registros
      let countQuery = `
        SELECT COUNT(*) as total 
        FROM efetivos e
        LEFT JOIN intolerancias i ON e.intolerancia_id = i.id
        WHERE e.unidade_escolar_id = ?
      `;
      let countParams = [unidade_escolar_id];
      
      if (search) {
        countQuery += ' AND (e.tipo_efetivo LIKE ? OR i.nome LIKE ?)';
        countParams.push(`%${search}%`, `%${search}%`);
      }
      
      if (status && status !== 'todos') {
        countQuery += ' AND e.tipo_efetivo = ?';
        countParams.push(status);
      }
      
      const totalResult = await executeQuery(countQuery, countParams);
      const totalItems = totalResult[0].total;

      // Gerar metadados de paginação
      const queryParams = { ...req.query };
      delete queryParams.page;
      delete queryParams.limit;
      
      const meta = pagination.generateMeta(totalItems, `/api/unidades-escolares/${unidade_escolar_id}/efetivos`, queryParams);

      // Adicionar links HATEOAS
      const efetivosComLinks = efetivos.map(efetivo => ({
        ...efetivo,
        links: [
          { rel: 'self', href: `/efetivos/${efetivo.id}`, method: 'GET' },
          { rel: 'update', href: `/efetivos/${efetivo.id}`, method: 'PUT' },
          { rel: 'delete', href: `/efetivos/${efetivo.id}`, method: 'DELETE' }
        ]
      }));

      res.json({
        success: true,
        data: efetivosComLinks,
        pagination: meta
      });
    } catch (error) {
      console.error('Erro ao listar efetivos:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  static async buscarEfetivoPorId(req, res) {
    try {
      const { id } = req.params;

      const query = `
        SELECT 
          e.id,
          e.unidade_escolar_id,
          e.tipo_efetivo,
          e.quantidade,
          e.intolerancia_id,
          e.criado_em,
          e.atualizado_em,
          i.nome as intolerancia_nome,
          ue.nome as unidade_escolar_nome
        FROM efetivos e
        LEFT JOIN intolerancias i ON e.intolerancia_id = i.id
        LEFT JOIN unidades_escolares ue ON e.unidade_escolar_id = ue.id
        WHERE e.id = ?
      `;

      const [efetivo] = await executeQuery(query, [parseInt(id)]);

      if (!efetivo) {
        return res.status(404).json({
          success: false,
          message: 'Efetivo não encontrado'
        });
      }

      // Adicionar links HATEOAS
      efetivo.links = [
        { rel: 'self', href: `/efetivos/${efetivo.id}`, method: 'GET' },
        { rel: 'update', href: `/efetivos/${efetivo.id}`, method: 'PUT' },
        { rel: 'delete', href: `/efetivos/${efetivo.id}`, method: 'DELETE' }
      ];

      res.json({
        success: true,
        data: efetivo
      });
    } catch (error) {
      console.error('Erro ao buscar efetivo:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }


}

module.exports = EfetivosListController;

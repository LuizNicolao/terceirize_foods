/**
 * Controller de Busca de Grupos
 * Responsável por funcionalidades de busca e filtros
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  notFoundResponse, 
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class GruposSearchController {
  
  /**
   * Buscar grupos ativos
   */
  static buscarGruposAtivos = asyncHandler(async (req, res) => {
    // Verificar se é para dropdown (sem paginação)
    const isForDropdown = req.query.limit === '1000' || req.query.dropdown === 'true';
    
    if (isForDropdown) {
      // Query simples para dropdown - sem paginação
      const query = `
        SELECT 
          g.id, 
          g.nome, 
          g.codigo,
          g.descricao,
          g.status, 
          g.data_cadastro as criado_em,
          g.data_atualizacao as atualizado_em
        FROM grupos g
        WHERE g.status = 'ativo'
        ORDER BY g.nome ASC
      `;
      
      const grupos = await executeQuery(query, []);
      
      return successResponse(res, grupos, 'Grupos ativos listados com sucesso', STATUS_CODES.OK);
    }

    // Query com paginação para listagem normal
    const pagination = req.pagination;
    let baseQuery = `
      SELECT 
        g.id, 
        g.nome, 
        g.codigo,
        g.descricao,
        g.status, 
        g.data_cadastro as criado_em,
        g.data_atualizacao as atualizado_em,
        COUNT(sg.id) as subgrupos_count
      FROM grupos g
      LEFT JOIN subgrupos sg ON g.id = sg.grupo_id
      WHERE g.status = 'ativo'
      GROUP BY g.id, g.nome, g.codigo, g.descricao, g.status, g.data_cadastro, g.data_atualizacao
    `;
    
    let params = [];
    baseQuery += ' ORDER BY g.nome ASC';

    // Aplicar paginação manualmente
    const limit = pagination.limit;
    const offset = pagination.offset;
    const query = `${baseQuery} LIMIT ${limit} OFFSET ${offset}`;
    
    // Executar query paginada
    const grupos = await executeQuery(query, params);

    // Contar total de registros
    const countQuery = `SELECT COUNT(*) as total FROM grupos WHERE status = 'ativo'`;
    const totalResult = await executeQuery(countQuery, []);
    const totalItems = totalResult[0].total;

    // Gerar metadados de paginação
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(totalItems, '/api/grupos/ativos', queryParams);

    // Retornar resposta no formato esperado pelo frontend
    return successResponse(res, grupos, 'Grupos ativos listados com sucesso', STATUS_CODES.OK, {
      ...meta,
      _links: res.addListLinks(grupos, meta.pagination, queryParams)._links
    });
  });

  /**
   * Buscar grupos por código
   */
  static buscarGruposPorCodigo = asyncHandler(async (req, res) => {
    const { codigo } = req.params;

    const grupos = await executeQuery(
      `SELECT 
        g.id, 
        g.nome, 
        g.codigo,
        g.descricao,
        g.status, 
        g.data_cadastro as criado_em,
        g.data_atualizacao as atualizado_em,
        COUNT(sg.id) as subgrupos_count
       FROM grupos g
       LEFT JOIN subgrupos sg ON g.id = sg.grupo_id
       WHERE g.codigo = ?
       GROUP BY g.id, g.nome, g.codigo, g.descricao, g.status, g.data_cadastro, g.data_atualizacao`,
      [codigo]
    );

    if (grupos.length === 0) {
      return notFoundResponse(res, 'Grupo não encontrado');
    }

    const grupo = grupos[0];

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(grupo);

    return successResponse(res, data, 'Grupo encontrado com sucesso', STATUS_CODES.OK);
  });

  /**
   * Buscar subgrupos de um grupo
   */
  static buscarSubgruposPorGrupo = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const pagination = req.pagination;

    // Verificar se grupo existe
    const grupo = await executeQuery(
      'SELECT id, nome FROM grupos WHERE id = ?',
      [id]
    );

    if (grupo.length === 0) {
      return notFoundResponse(res, 'Grupo não encontrado');
    }

    // Query base para subgrupos
    let baseQuery = `
      SELECT 
        sg.id, 
        sg.nome, 
        sg.codigo,
        sg.descricao,
        sg.status, 
        sg.criado_em,
        sg.atualizado_em
      FROM subgrupos sg
      WHERE sg.grupo_id = ?
    `;
    
    let params = [id];
    baseQuery += ' ORDER BY sg.nome ASC';

    // Aplicar paginação manualmente
    const limit = pagination.limit;
    const offset = pagination.offset;
    const query = `${baseQuery} LIMIT ${limit} OFFSET ${offset}`;
    
    // Executar query paginada
    const subgrupos = await executeQuery(query, params);

    // Contar total de registros
    const countQuery = `SELECT COUNT(*) as total FROM subgrupos WHERE grupo_id = ?`;
    const totalResult = await executeQuery(countQuery, [id]);
    const totalItems = totalResult[0].total;

    // Gerar metadados de paginação
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(totalItems, `/api/grupos/${id}/subgrupos`, queryParams);

    // Retornar resposta no formato esperado pelo frontend
    return successResponse(res, subgrupos, `Subgrupos do grupo ${grupo[0].nome} listados com sucesso`, STATUS_CODES.OK, {
      ...meta,
      _links: res.addListLinks(subgrupos, meta.pagination, queryParams)._links
    });
  });
}

module.exports = GruposSearchController;

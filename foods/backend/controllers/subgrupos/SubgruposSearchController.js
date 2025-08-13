/**
 * Controller de Busca de Subgrupos
 * Responsável por funcionalidades de busca e filtros
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  notFoundResponse, 
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class SubgruposSearchController {
  
  /**
   * Buscar subgrupos ativos
   */
  static buscarSubgruposAtivos = asyncHandler(async (req, res) => {
    const pagination = req.pagination;

    // Query base
    let baseQuery = `
      SELECT 
        sg.id, 
        sg.nome, 
        sg.codigo,
        sg.descricao,
        sg.grupo_id,
        sg.status, 
        sg.data_cadastro as criado_em,
        sg.data_atualizacao as atualizado_em,
        g.nome as grupo_nome,
        COUNT(p.id) as total_produtos
      FROM subgrupos sg
      LEFT JOIN grupos g ON sg.grupo_id = g.id
      LEFT JOIN produtos p ON sg.id = p.subgrupo_id
      WHERE sg.status = 'ativo'
      GROUP BY sg.id, sg.nome, sg.codigo, sg.descricao, sg.grupo_id, sg.status, sg.data_cadastro, sg.data_atualizacao, g.nome
    `;
    
    let params = [];
    baseQuery += ' ORDER BY sg.nome ASC';

    // Aplicar paginação manualmente
    const limit = pagination.limit;
    const offset = pagination.offset;
    const query = `${baseQuery} LIMIT ${limit} OFFSET ${offset}`;
    
    // Executar query paginada
    const subgrupos = await executeQuery(query, params);

    // Contar total de registros
    const countQuery = `SELECT COUNT(*) as total FROM subgrupos WHERE status = 'ativo'`;
    const totalResult = await executeQuery(countQuery, []);
    const totalItems = totalResult[0].total;

    // Gerar metadados de paginação
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(totalItems, '/api/subgrupos/ativos', queryParams);

    // Retornar resposta no formato esperado pelo frontend
    return successResponse(res, subgrupos, 'Subgrupos ativos listados com sucesso', STATUS_CODES.OK, {
      ...meta,
      _links: res.addListLinks(subgrupos, meta.pagination, queryParams)._links
    });
  });

  /**
   * Buscar subgrupos por grupo
   */
  static buscarSubgruposPorGrupo = asyncHandler(async (req, res) => {
    const { grupo_id } = req.params;
    const pagination = req.pagination;

    // Verificar se grupo existe
    const grupo = await executeQuery(
      'SELECT id, nome FROM grupos WHERE id = ?',
      [grupo_id]
    );

    if (grupo.length === 0) {
      return notFoundResponse(res, 'Grupo não encontrado');
    }

    // Query base para subgrupos do grupo
    let baseQuery = `
      SELECT 
        sg.id, 
        sg.nome, 
        sg.codigo,
        sg.descricao,
        sg.grupo_id,
        sg.status, 
        sg.data_cadastro as criado_em,
        sg.data_atualizacao as atualizado_em,
        g.nome as grupo_nome,
        COUNT(p.id) as total_produtos
      FROM subgrupos sg
      LEFT JOIN grupos g ON sg.grupo_id = g.id
      LEFT JOIN produtos p ON sg.id = p.subgrupo_id
      WHERE sg.grupo_id = ?
      GROUP BY sg.id, sg.nome, sg.codigo, sg.descricao, sg.grupo_id, sg.status, sg.data_cadastro, sg.data_atualizacao, g.nome
    `;
    
    let params = [grupo_id];
    baseQuery += ' ORDER BY sg.nome ASC';

    // Aplicar paginação manualmente
    const limit = pagination.limit;
    const offset = pagination.offset;
    const query = `${baseQuery} LIMIT ${limit} OFFSET ${offset}`;
    
    // Executar query paginada
    const subgrupos = await executeQuery(query, params);

    // Contar total de registros
    const countQuery = `SELECT COUNT(*) as total FROM subgrupos WHERE grupo_id = ?`;
    const totalResult = await executeQuery(countQuery, [grupo_id]);
    const totalItems = totalResult[0].total;

    // Gerar metadados de paginação
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(totalItems, `/api/subgrupos/grupo/${grupo_id}`, queryParams);

    // Retornar resposta no formato esperado pelo frontend
    return successResponse(res, subgrupos, `Subgrupos do grupo ${grupo[0].nome} listados com sucesso`, STATUS_CODES.OK, {
      ...meta,
      _links: res.addListLinks(subgrupos, meta.pagination, queryParams)._links
    });
  });

  /**
   * Buscar subgrupos por código
   */
  static buscarSubgruposPorCodigo = asyncHandler(async (req, res) => {
    const { codigo } = req.params;

    const subgrupos = await executeQuery(
      `SELECT 
        sg.id, 
        sg.nome, 
        sg.codigo,
        sg.descricao,
        sg.grupo_id,
        sg.status, 
        sg.data_cadastro as criado_em,
        sg.data_atualizacao as atualizado_em,
        g.nome as grupo_nome,
        COUNT(p.id) as total_produtos
       FROM subgrupos sg
       LEFT JOIN grupos g ON sg.grupo_id = g.id
       LEFT JOIN produtos p ON sg.id = p.subgrupo_id
       WHERE sg.codigo = ?
       GROUP BY sg.id, sg.nome, sg.codigo, sg.descricao, sg.grupo_id, sg.status, sg.data_cadastro, sg.data_atualizacao, g.nome`,
      [codigo]
    );

    if (subgrupos.length === 0) {
      return notFoundResponse(res, 'Subgrupo não encontrado');
    }

    const subgrupo = subgrupos[0];

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(subgrupo);

    return successResponse(res, data, 'Subgrupo encontrado com sucesso', STATUS_CODES.OK);
  });
}

module.exports = SubgruposSearchController;

/**
 * Controller de Busca de Almoxarifado
 * Responsável por funcionalidades de busca e filtros
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  notFoundResponse,
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class AlmoxarifadoSearchController {
  
  /**
   * Buscar almoxarifados ativos
   */
  static buscarAlmoxarifadosAtivos = asyncHandler(async (req, res) => {
    const pagination = req.pagination;
    const { filial_id, centro_custo_id } = req.query;

    // Query base
    let baseQuery = `
      SELECT 
        a.id, 
        a.codigo,
        a.nome, 
        a.filial_id,
        f.filial as filial_nome,
        f.codigo_filial,
        a.centro_custo_id,
        cc.codigo as centro_custo_codigo,
        cc.nome as centro_custo_nome,
        a.observacoes,
        a.status, 
        a.criado_em,
        a.atualizado_em
      FROM almoxarifado a
      LEFT JOIN filiais f ON a.filial_id = f.id
      LEFT JOIN centro_custo cc ON a.centro_custo_id = cc.id
      WHERE a.status = 1
    `;
    
    let params = [];

    if (filial_id) {
      baseQuery += ' AND a.filial_id = ?';
      params.push(filial_id);
    }

    if (centro_custo_id) {
      baseQuery += ' AND a.centro_custo_id = ?';
      params.push(centro_custo_id);
    }
    
    baseQuery += ' ORDER BY a.nome ASC';

    // Aplicar paginação usando valores diretos na query
    const paginatedQuery = baseQuery + ` LIMIT ${pagination.limit} OFFSET ${pagination.offset}`;
    
    // Executar query paginada
    const almoxarifados = await executeQuery(paginatedQuery, params);

    // Contar total de registros
    let countQuery = `SELECT COUNT(*) as total FROM almoxarifado WHERE status = 1`;
    let countParams = [];
    
    if (filial_id) {
      countQuery += ' AND filial_id = ?';
      countParams.push(filial_id);
    }

    if (centro_custo_id) {
      countQuery += ' AND centro_custo_id = ?';
      countParams.push(centro_custo_id);
    }
    
    const totalResult = await executeQuery(countQuery, countParams);
    const totalItems = totalResult[0].total;

    // Gerar metadados de paginação
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(totalItems, '/api/almoxarifado/ativos', queryParams);

    // Retornar resposta no formato esperado pelo frontend
    return successResponse(res, almoxarifados, 'Almoxarifados ativos listados com sucesso', STATUS_CODES.OK, {
      ...meta,
      _links: res.addListLinks(almoxarifados, meta.pagination, queryParams)._links
    });
  });

  /**
   * Buscar almoxarifado por código
   */
  static buscarAlmoxarifadoPorCodigo = asyncHandler(async (req, res) => {
    const { codigo } = req.params;

    const almoxarifados = await executeQuery(
      `SELECT 
        a.id, 
        a.codigo,
        a.nome, 
        a.filial_id,
        f.filial as filial_nome,
        f.codigo_filial,
        a.centro_custo_id,
        cc.codigo as centro_custo_codigo,
        cc.nome as centro_custo_nome,
        a.observacoes,
        a.status, 
        a.criado_em,
        a.atualizado_em
       FROM almoxarifado a
       LEFT JOIN filiais f ON a.filial_id = f.id
       LEFT JOIN centro_custo cc ON a.centro_custo_id = cc.id
       WHERE a.codigo = ?`,
      [codigo]
    );

    if (almoxarifados.length === 0) {
      return notFoundResponse(res, 'Almoxarifado não encontrado');
    }

    const almoxarifado = almoxarifados[0];

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(almoxarifado);

    return successResponse(res, data, 'Almoxarifado encontrado com sucesso', STATUS_CODES.OK);
  });

  /**
   * Buscar almoxarifados por filial
   */
  static buscarAlmoxarifadosPorFilial = asyncHandler(async (req, res) => {
    const { filial_id } = req.params;
    const pagination = req.pagination;

    // Verificar se filial existe
    const filial = await executeQuery(
      'SELECT id, filial FROM filiais WHERE id = ?',
      [filial_id]
    );

    if (filial.length === 0) {
      return notFoundResponse(res, 'Filial não encontrada');
    }

    // Query base
    let baseQuery = `
      SELECT 
        a.id, 
        a.codigo,
        a.nome, 
        a.filial_id,
        f.filial as filial_nome,
        f.codigo_filial,
        a.centro_custo_id,
        cc.codigo as centro_custo_codigo,
        cc.nome as centro_custo_nome,
        a.observacoes,
        a.status, 
        a.criado_em,
        a.atualizado_em
      FROM almoxarifado a
      LEFT JOIN filiais f ON a.filial_id = f.id
      LEFT JOIN centro_custo cc ON a.centro_custo_id = cc.id
      WHERE a.filial_id = ? AND a.status = 1
    `;
    
    baseQuery += ' ORDER BY a.nome ASC';

    // Aplicar paginação usando valores diretos na query
    const paginatedQuery = baseQuery + ` LIMIT ${pagination.limit} OFFSET ${pagination.offset}`;
    
    // Executar query paginada
    const almoxarifados = await executeQuery(paginatedQuery, [filial_id]);

    // Contar total de registros
    const countQuery = `SELECT COUNT(*) as total FROM almoxarifado WHERE filial_id = ? AND status = 1`;
    const totalResult = await executeQuery(countQuery, [filial_id]);
    const totalItems = totalResult[0].total;

    // Gerar metadados de paginação
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(totalItems, `/api/almoxarifado/filial/${filial_id}`, queryParams);

    // Retornar resposta no formato esperado pelo frontend
    return successResponse(res, almoxarifados, `Almoxarifados da filial ${filial[0].filial} listados com sucesso`, STATUS_CODES.OK, {
      ...meta,
      _links: res.addListLinks(almoxarifados, meta.pagination, queryParams)._links
    });
  });

  /**
   * Buscar almoxarifados por centro de custo
   */
  static buscarAlmoxarifadosPorCentroCusto = asyncHandler(async (req, res) => {
    const { centro_custo_id } = req.params;
    const pagination = req.pagination;

    // Verificar se centro de custo existe
    const centroCusto = await executeQuery(
      'SELECT id, nome FROM centro_custo WHERE id = ?',
      [centro_custo_id]
    );

    if (centroCusto.length === 0) {
      return notFoundResponse(res, 'Centro de custo não encontrado');
    }

    // Query base
    let baseQuery = `
      SELECT 
        a.id, 
        a.codigo,
        a.nome, 
        a.filial_id,
        f.filial as filial_nome,
        f.codigo_filial,
        a.centro_custo_id,
        cc.codigo as centro_custo_codigo,
        cc.nome as centro_custo_nome,
        a.observacoes,
        a.status, 
        a.criado_em,
        a.atualizado_em
      FROM almoxarifado a
      LEFT JOIN filiais f ON a.filial_id = f.id
      LEFT JOIN centro_custo cc ON a.centro_custo_id = cc.id
      WHERE a.centro_custo_id = ? AND a.status = 1
    `;
    
    baseQuery += ' ORDER BY a.nome ASC';

    // Aplicar paginação usando valores diretos na query
    const paginatedQuery = baseQuery + ` LIMIT ${pagination.limit} OFFSET ${pagination.offset}`;
    
    // Executar query paginada
    const almoxarifados = await executeQuery(paginatedQuery, [centro_custo_id]);

    // Contar total de registros
    const countQuery = `SELECT COUNT(*) as total FROM almoxarifado WHERE centro_custo_id = ? AND status = 1`;
    const totalResult = await executeQuery(countQuery, [centro_custo_id]);
    const totalItems = totalResult[0].total;

    // Gerar metadados de paginação
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(totalItems, `/api/almoxarifado/centro-custo/${centro_custo_id}`, queryParams);

    // Retornar resposta no formato esperado pelo frontend
    return successResponse(res, almoxarifados, `Almoxarifados do centro de custo ${centroCusto[0].nome} listados com sucesso`, STATUS_CODES.OK, {
      ...meta,
      _links: res.addListLinks(almoxarifados, meta.pagination, queryParams)._links
    });
  });
}

module.exports = AlmoxarifadoSearchController;


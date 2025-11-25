/**
 * Controller de Busca de Centro de Custo
 * Responsável por funcionalidades de busca e filtros
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  notFoundResponse,
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class CentroCustoSearchController {
  
  /**
   * Buscar centros de custo ativos
   */
  static buscarCentrosCustoAtivos = asyncHandler(async (req, res) => {
    const pagination = req.pagination;

    // Query base
    let baseQuery = `
      SELECT 
        cc.id, 
        cc.codigo,
        cc.nome, 
        cc.descricao,
        cc.filial_id,
        f.filial as filial_nome,
        f.codigo_filial,
        cc.status, 
        cc.criado_em,
        cc.atualizado_em
      FROM centro_custo cc
      LEFT JOIN filiais f ON cc.filial_id = f.id
      WHERE cc.status = 1
    `;
    
    baseQuery += ' ORDER BY cc.nome ASC';

    // Aplicar paginação usando valores diretos na query
    const paginatedQuery = baseQuery + ` LIMIT ${pagination.limit} OFFSET ${pagination.offset}`;
    
    // Executar query paginada
    const centrosCusto = await executeQuery(paginatedQuery, []);

    // Contar total de registros
    const countQuery = `SELECT COUNT(*) as total FROM centro_custo WHERE status = 1`;
    const totalResult = await executeQuery(countQuery, []);
    const totalItems = totalResult[0].total;

    // Gerar metadados de paginação
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(totalItems, '/api/centro-custo/ativos', queryParams);

    // Retornar resposta no formato esperado pelo frontend
    return successResponse(res, centrosCusto, 'Centros de custo ativos listados com sucesso', STATUS_CODES.OK, {
      ...meta,
      _links: res.addListLinks(centrosCusto, meta.pagination, queryParams)._links
    });
  });

  /**
   * Buscar centro de custo por código
   */
  static buscarCentroCustoPorCodigo = asyncHandler(async (req, res) => {
    const { codigo } = req.params;

    const centrosCusto = await executeQuery(
      `SELECT 
        cc.id, 
        cc.codigo,
        cc.nome, 
        cc.descricao,
        cc.filial_id,
        f.filial as filial_nome,
        f.codigo_filial,
        cc.status, 
        cc.criado_em,
        cc.atualizado_em
       FROM centro_custo cc
       LEFT JOIN filiais f ON cc.filial_id = f.id
       WHERE cc.codigo = ?`,
      [codigo]
    );

    if (centrosCusto.length === 0) {
      return notFoundResponse(res, 'Centro de custo não encontrado');
    }

    const centroCusto = centrosCusto[0];

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(centroCusto);

    return successResponse(res, data, 'Centro de custo encontrado com sucesso', STATUS_CODES.OK);
  });

  /**
   * Buscar centros de custo por filial
   */
  static buscarCentrosCustoPorFilial = asyncHandler(async (req, res) => {
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
        cc.id, 
        cc.codigo,
        cc.nome, 
        cc.descricao,
        cc.filial_id,
        f.filial as filial_nome,
        f.codigo_filial,
        cc.status, 
        cc.criado_em,
        cc.atualizado_em
      FROM centro_custo cc
      LEFT JOIN filiais f ON cc.filial_id = f.id
      WHERE cc.filial_id = ? AND cc.status = 1
    `;
    
    baseQuery += ' ORDER BY cc.nome ASC';

    // Aplicar paginação usando valores diretos na query
    const paginatedQuery = baseQuery + ` LIMIT ${pagination.limit} OFFSET ${pagination.offset}`;
    
    // Executar query paginada
    const centrosCusto = await executeQuery(paginatedQuery, [filial_id]);

    // Contar total de registros
    const countQuery = `SELECT COUNT(*) as total FROM centro_custo WHERE filial_id = ? AND status = 1`;
    const totalResult = await executeQuery(countQuery, [filial_id]);
    const totalItems = totalResult[0].total;

    // Gerar metadados de paginação
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(totalItems, `/api/centro-custo/filial/${filial_id}`, queryParams);

    // Retornar resposta no formato esperado pelo frontend
    return successResponse(res, centrosCusto, `Centros de custo da filial ${filial[0].filial} listados com sucesso`, STATUS_CODES.OK, {
      ...meta,
      _links: res.addListLinks(centrosCusto, meta.pagination, queryParams)._links
    });
  });
}

module.exports = CentroCustoSearchController;


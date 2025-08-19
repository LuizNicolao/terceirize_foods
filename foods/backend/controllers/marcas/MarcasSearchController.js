/**
 * Controller de Busca de Marcas
 * Responsável por funcionalidades de busca e filtros
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');
const { paginatedResponse } = require('../../middleware/pagination');

class MarcasSearchController {
  
  /**
   * Buscar marcas ativas
   */
  static buscarAtivas = asyncHandler(async (req, res) => {
    // Query base
    let baseQuery = `
      SELECT 
        m.id, 
        m.marca, 
        m.fabricante,
        m.status, 
        m.criado_em,
        m.atualizado_em,
        COUNT(p.id) as total_produtos
      FROM marcas m
      LEFT JOIN produtos p ON m.id = p.marca_id
      WHERE m.status = 1
      GROUP BY m.id, m.marca, m.fabricante, m.status, m.criado_em, m.atualizado_em
    `;
    
    let params = [];
    baseQuery += ' ORDER BY m.marca ASC';

    // Usar a função padronizada de paginação
    const result = await paginatedResponse(req, res, baseQuery, params, '/api/marcas/ativas');
    
    // Adicionar links HATEOAS
    const data = res.addListLinks(result.data, result.meta.pagination, req.query);

    return successResponse(res, data, 'Marcas ativas listadas com sucesso', STATUS_CODES.OK, result.meta);
  });

  /**
   * Buscar marcas por fabricante
   */
  static buscarPorFabricante = asyncHandler(async (req, res) => {
    const { fabricante } = req.params;
    const pagination = req.pagination;

    // Query base para marcas do fabricante
    let baseQuery = `
      SELECT 
        m.id, 
        m.marca, 
        m.fabricante,
        m.status, 
        m.criado_em,
        m.atualizado_em,
        COUNT(p.id) as total_produtos
      FROM marcas m
      LEFT JOIN produtos p ON m.id = p.marca_id
      WHERE m.fabricante LIKE ?
      GROUP BY m.id, m.marca, m.fabricante, m.status, m.criado_em, m.atualizado_em
    `;
    
    let params = [`%${fabricante}%`];
    baseQuery += ' ORDER BY m.marca ASC';

    // Aplicar paginação manualmente
    const limit = pagination.limit;
    const offset = pagination.offset;
    const query = `${baseQuery} LIMIT ${limit} OFFSET ${offset}`;
    
    // Executar query paginada
    const marcas = await executeQuery(query, params);

    // Contar total de registros
    const countQuery = `SELECT COUNT(*) as total FROM marcas WHERE fabricante LIKE ?`;
    const totalResult = await executeQuery(countQuery, [`%${fabricante}%`]);
    const totalItems = totalResult[0].total;

    // Gerar metadados de paginação
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(totalItems, `/api/marcas/fabricante/${fabricante}`, queryParams);

    // Retornar resposta no formato esperado pelo frontend
    return successResponse(res, marcas, `Marcas do fabricante ${fabricante} listadas com sucesso`, STATUS_CODES.OK, {
      ...meta,
      _links: res.addListLinks(marcas, meta.pagination, queryParams)._links
    });
  });
}

module.exports = MarcasSearchController;

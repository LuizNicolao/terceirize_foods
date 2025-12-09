const { executeQuery } = require('../../config/database');
const { successResponse, STATUS_CODES } = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

/**
 * Controller para listagem de Tipos de Pratos
 * Segue padrão de excelência do sistema
 */
class TiposPratosListController {
  /**
   * Listar tipos de pratos com filtros e paginação
   */
  static listar = asyncHandler(async (req, res) => {
    const { search = '' } = req.query;
    const pagination = req.pagination;

    // Query base
    let baseQuery = `
      SELECT 
        id,
        codigo,
        tipo_prato,
        descricao,
        status,
        data_cadastro,
        data_atualizacao
      FROM tipos_pratos
      WHERE 1=1
    `;
    
    let params = [];

    // Aplicar filtros
    if (search) {
      baseQuery += ` AND (
        codigo LIKE ? OR 
        tipo_prato LIKE ? OR 
        descricao LIKE ?
      )`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }

    // Ordenação
    const sortBy = req.query.sortBy || 'data_cadastro';
    const sortOrder = req.query.sortOrder || 'DESC';
    baseQuery += ` ORDER BY ${sortBy} ${sortOrder}`;

    // Contar total de registros
    const countQuery = baseQuery.replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(*) as total FROM');
    const countResult = await executeQuery(countQuery, params);
    const total = countResult[0]?.total || 0;

    // Aplicar paginação
    const limit = pagination.limit;
    const offset = pagination.offset;
    const query = `${baseQuery} LIMIT ${limit} OFFSET ${offset}`;

    // Executar query
    const tiposPratos = await executeQuery(query, params);

    // Preparar resposta com paginação (usando formato padronizado)
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(total, '/api/tipos-pratos', queryParams);
    
    const response = {
      items: tiposPratos,
      pagination: meta.pagination
    };

    return successResponse(res, response, 'Tipos de pratos listados com sucesso', STATUS_CODES.OK);
  });

  /**
   * Exportar tipos de pratos em JSON
   */
  static exportarJSON = asyncHandler(async (req, res) => {
    const tiposPratos = await executeQuery(
      `SELECT 
        id,
        codigo,
        tipo_prato,
        descricao,
        status,
        data_cadastro,
        data_atualizacao
      FROM tipos_pratos
      ORDER BY data_cadastro DESC`
    );

    return successResponse(res, tiposPratos, 'Tipos de pratos exportados com sucesso', STATUS_CODES.OK);
  });
}

module.exports = TiposPratosListController;


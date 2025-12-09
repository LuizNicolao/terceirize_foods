const { executeQuery } = require('../../config/database');
const { successResponse, STATUS_CODES } = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

/**
 * Controller para listagem de Tipos de Receitas
 * Segue padrão de excelência do sistema
 */
class TiposReceitasListController {
  /**
   * Listar tipos de receitas com filtros e paginação
   */
  static listar = asyncHandler(async (req, res) => {
    const { search = '' } = req.query;
    const pagination = req.pagination;

    // Query base
    let baseQuery = `
      SELECT 
        id,
        codigo,
        tipo_receita,
        descricao,
        status,
        data_cadastro,
        data_atualizacao
      FROM tipos_receitas
      WHERE 1=1
    `;
    
    let params = [];

    // Aplicar filtros
    if (search) {
      baseQuery += ` AND (
        codigo LIKE ? OR 
        tipo_receita LIKE ? OR 
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
    const tiposReceitas = await executeQuery(query, params);

    // Preparar resposta com paginação (usando formato padronizado)
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(total, '/api/tipos-receitas', queryParams);
    
    const response = {
      items: tiposReceitas,
      pagination: meta.pagination
    };

    return successResponse(res, response, 'Tipos de receitas listados com sucesso', STATUS_CODES.OK);
  });

  /**
   * Exportar tipos de receitas em JSON
   */
  static exportarJSON = asyncHandler(async (req, res) => {
    const tiposReceitas = await executeQuery(
      `SELECT 
        id,
        codigo,
        tipo_receita,
        descricao,
        status,
        data_cadastro,
        data_atualizacao
      FROM tipos_receitas
      ORDER BY data_cadastro DESC`
    );

    return successResponse(res, tiposReceitas, 'Tipos de receitas exportados com sucesso', STATUS_CODES.OK);
  });
}

module.exports = TiposReceitasListController;


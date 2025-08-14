/**
 * Middleware de paginação
 * Adiciona parâmetros de paginação ao request
 */

const paginationMiddleware = (req, res, next) => {
  // Parâmetros de paginação
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  // Validar limites
  const maxLimit = 100;
  const validLimit = Math.min(limit, maxLimit);

  // Adicionar parâmetros ao request
  req.pagination = {
    page,
    limit: validLimit,
    offset,
    maxLimit
  };

  next();
};

/**
 * Função para criar resposta paginada
 * @param {Array} data - Dados da consulta
 * @param {number} total - Total de registros
 * @param {Object} pagination - Objeto de paginação
 * @param {string} baseUrl - URL base para links
 * @returns {Object} Resposta paginada
 */
const createPaginatedResponse = (data, total, pagination, baseUrl) => {
  const { page, limit } = pagination;
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  const response = {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext,
      hasPrev
    },
    links: {
      self: `${baseUrl}?page=${page}&limit=${limit}`,
      first: `${baseUrl}?page=1&limit=${limit}`,
      last: `${baseUrl}?page=${totalPages}&limit=${limit}`,
      next: hasNext ? `${baseUrl}?page=${page + 1}&limit=${limit}` : null,
      prev: hasPrev ? `${baseUrl}?page=${page - 1}&limit=${limit}` : null
    }
  };

  return response;
};

/**
 * Middleware para aplicar paginação em consultas SQL
 * @param {string} baseQuery - Query base sem LIMIT/OFFSET
 * @param {Array} params - Parâmetros da query
 * @param {Object} pagination - Objeto de paginação
 * @returns {Object} Query finalizada e query de contagem
 */
const applyPagination = (baseQuery, params, pagination) => {
  const { limit, offset } = pagination;
  
  // Query com paginação
  const paginatedQuery = `${baseQuery} LIMIT ? OFFSET ?`;
  const paginatedParams = [...params, limit, offset];
  
  // Query para contar total de registros
  const countQuery = `SELECT COUNT(*) as total FROM (${baseQuery}) as count_table`;
  
  return {
    paginatedQuery,
    paginatedParams,
    countQuery,
    countParams: params
  };
};

module.exports = {
  paginationMiddleware,
  createPaginatedResponse,
  applyPagination
};

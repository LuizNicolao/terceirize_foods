/**
 * Middleware para paginação da API
 * Implementa padrões RESTful com paginação consistente
 */

const paginationMiddleware = (req, res, next) => {
  // Valores padrão
  const defaultPage = 1;
  const defaultLimit = 10;
  const maxLimit = 100;

  // Extrair parâmetros da query
  let page = parseInt(req.query.page) || defaultPage;
  let limit = parseInt(req.query.limit) || defaultLimit;

  // Validar e ajustar valores
  page = Math.max(1, page);
  limit = Math.min(Math.max(1, limit), maxLimit);

  // Calcular offset
  const offset = (page - 1) * limit;

  // Adicionar informações de paginação ao request
  req.pagination = {
    page,
    limit,
    offset,
    defaultPage,
    defaultLimit,
    maxLimit
  };

  next();
};

// Função para criar resposta paginada
const createPaginatedResponse = (data, total, req, additionalMeta = {}) => {
  const { page, limit } = req.pagination;
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  const meta = {
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? page + 1 : null,
      prevPage: hasPrevPage ? page - 1 : null
    },
    ...additionalMeta
  };

  return {
    data,
    meta
  };
};

// Função para criar links HATEOAS de paginação
const createPaginationLinks = (req, totalPages) => {
  const { page } = req.pagination;
  const baseUrl = `${req.protocol}://${req.get('host')}${req.originalUrl.split('?')[0]}`;
  
  const links = {
    self: `${baseUrl}?page=${page}`,
    first: `${baseUrl}?page=1`,
    last: `${baseUrl}?page=${totalPages}`,
  };

  if (page > 1) {
    links.prev = `${baseUrl}?page=${page - 1}`;
  }

  if (page < totalPages) {
    links.next = `${baseUrl}?page=${page + 1}`;
  }

  return links;
};

module.exports = {
  paginationMiddleware,
  createPaginatedResponse,
  createPaginationLinks
};

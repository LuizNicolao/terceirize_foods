/**
 * Middleware de paginação padronizado
 * Implementa paginação consistente em todas as APIs
 */

const { executeQuery } = require('../config/database');

// Configurações padrão de paginação
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 1000;

// Classe para gerenciar paginação
class PaginationHelper {
  constructor(page = DEFAULT_PAGE, limit = DEFAULT_LIMIT) {
    this.page = Math.max(1, parseInt(page) || DEFAULT_PAGE);
    this.limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(limit) || DEFAULT_LIMIT));
    this.offset = (this.page - 1) * this.limit;
  }

  // Gerar metadados de paginação
  generateMeta(totalItems, baseUrl, queryParams = {}) {
    const totalPages = Math.ceil(totalItems / this.limit);
    const hasNextPage = this.page < totalPages;
    const hasPrevPage = this.page > 1;

    const meta = {
      pagination: {
        currentPage: this.page,
        totalPages,
        totalItems,
        itemsPerPage: this.limit,
        hasNextPage,
        hasPrevPage
      },
      links: {
        self: this.buildUrl(baseUrl, this.page, queryParams),
        first: this.buildUrl(baseUrl, 1, queryParams),
        last: this.buildUrl(baseUrl, totalPages, queryParams)
      }
    };

    if (hasNextPage) {
      meta.links.next = this.buildUrl(baseUrl, this.page + 1, queryParams);
    }

    if (hasPrevPage) {
      meta.links.prev = this.buildUrl(baseUrl, this.page - 1, queryParams);
    }

    return meta;
  }

  // Construir URL com parâmetros de paginação
  buildUrl(baseUrl, page, queryParams = {}) {
    const url = new URL(baseUrl, 'http://localhost');
    
    // Adicionar parâmetros de paginação
    url.searchParams.set('page', page.toString());
    url.searchParams.set('limit', this.limit.toString());
    
    // Adicionar outros parâmetros de query
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, value.toString());
      }
    });

    return url.pathname + url.search;
  }

  // Aplicar paginação em query SQL
  applyPagination(query, params = []) {
    return {
      query: `${query} LIMIT ? OFFSET ?`,
      params: [...params, this.limit, this.offset]
    };
  }

  // Contar total de registros
  async getTotalCount(countQuery, params = []) {
    try {
      const result = await executeQuery(countQuery, params);
      return result[0]?.total || 0;
    } catch (error) {
      console.error('Erro ao contar registros:', error);
      return 0;
    }
  }
}

// Middleware para extrair parâmetros de paginação
const paginationMiddleware = (req, res, next) => {
  const page = parseInt(req.query.page) || DEFAULT_PAGE;
  const limit = parseInt(req.query.limit) || DEFAULT_LIMIT;
  
  req.pagination = new PaginationHelper(page, limit);
  next();
};

// Função para aplicar paginação em listagens
const applyPagination = async (req, res, baseQuery, countQuery, params = [], baseUrl) => {
  try {
    const pagination = req.pagination;
    
    // Contar total de registros
    const totalItems = await pagination.getTotalCount(countQuery, params);
    
    // Aplicar paginação na query principal
    const { query, params: paginatedParams } = pagination.applyPagination(baseQuery, params);
    
    // Executar query paginada
    const items = await executeQuery(query, paginatedParams);
    
    // Gerar metadados de paginação
    const queryParams = { ...req.query };
    delete queryParams.page; // Remover page atual para construir links
    delete queryParams.limit; // Remover limit atual para construir links
    
    const meta = pagination.generateMeta(totalItems, baseUrl, queryParams);
    
    return {
      items,
      meta
    };
  } catch (error) {
    console.error('Erro na paginação:', error);
    throw error;
  }
};

// Função para criar query de contagem baseada na query principal
const createCountQuery = (baseQuery) => {
  // Remover ORDER BY se existir
  const queryWithoutOrder = baseQuery.replace(/\s+ORDER\s+BY\s+.*$/i, '');
  
  // Criar query de contagem
  return `SELECT COUNT(*) as total FROM (${queryWithoutOrder}) as count_table`;
};

// Middleware para resposta paginada padronizada
const paginatedResponse = async (req, res, baseQuery, params = [], baseUrl) => {
  try {
    const countQuery = createCountQuery(baseQuery);
    const { items, meta } = await applyPagination(req, res, baseQuery, countQuery, params, baseUrl);
    
    return {
      success: true,
      data: items,
      meta
    };
  } catch (error) {
    console.error('Erro na resposta paginada:', error);
    throw error;
  }
};

module.exports = {
  PaginationHelper,
  paginationMiddleware,
  applyPagination,
  createCountQuery,
  paginatedResponse,
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MAX_LIMIT
}; 
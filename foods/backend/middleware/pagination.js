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
    // Garantir que page e limit sejam números inteiros
    this.page = Math.max(1, parseInt(page) || DEFAULT_PAGE);
    this.limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(limit) || DEFAULT_LIMIT));
    this.offset = (this.page - 1) * this.limit;
    
    // Log para debug
    console.log('PaginationHelper Debug:', {
      inputPage: page,
      inputLimit: limit,
      calculatedPage: this.page,
      calculatedLimit: this.limit,
      calculatedOffset: this.offset
    });
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
    // Garantir que limit e offset sejam números inteiros
    const limit = parseInt(this.limit) || 20;
    const offset = parseInt(this.offset) || 0;
    
    const paginatedParams = [...params, limit, offset];
    
    // Log para debug
    console.log('Pagination Debug:', {
      originalParams: params,
      limit: limit,
      offset: offset,
      paginatedParams: paginatedParams,
      query: `${query} LIMIT ? OFFSET ?`
    });
    
    return {
      query: `${query} LIMIT ? OFFSET ?`,
      params: paginatedParams
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
  // Garantir que page e limit sejam números válidos
  const page = parseInt(req.query.page) || DEFAULT_PAGE;
  const limit = parseInt(req.query.limit) || DEFAULT_LIMIT;
  
  // Log para debug
  console.log('PaginationMiddleware Debug:', {
    queryPage: req.query.page,
    queryLimit: req.query.limit,
    parsedPage: page,
    parsedLimit: limit
  });
  
  req.pagination = new PaginationHelper(page, limit);
  next();
};

// Função para aplicar paginação em listagens
const applyPagination = async (req, res, baseQuery, countQuery, params = [], baseUrl) => {
  try {
    const pagination = req.pagination;
    
    console.log('applyPagination Debug:', {
      countQuery: countQuery,
      countParams: params,
      paramsType: typeof params,
      paramsLength: params.length
    });
    
    // Contar total de registros
    const totalItems = await pagination.getTotalCount(countQuery, params);
    console.log('Total items:', totalItems);
    
    // Aplicar paginação na query principal
    const { query, params: paginatedParams } = pagination.applyPagination(baseQuery, params);
    
    console.log('Final query:', query);
    console.log('Final params:', paginatedParams);
    console.log('Final params types:', paginatedParams.map(p => typeof p));
    
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
    console.error('Query base:', baseQuery);
    console.error('Query de contagem:', countQuery);
    console.error('Parâmetros:', params);
    console.error('Parâmetros tipo:', typeof params);
    throw error;
  }
};

// Função para criar query de contagem baseada na query principal
const createCountQuery = (baseQuery) => {
  // Remover ORDER BY se existir
  const queryWithoutOrder = baseQuery.replace(/\s+ORDER\s+BY\s+.*$/i, '');
  
  // Verificar se a query tem GROUP BY
  if (queryWithoutOrder.toUpperCase().includes('GROUP BY')) {
    // Para queries com GROUP BY, criar uma query de contagem mais simples
    // Extrair a tabela principal e condições WHERE
    const fromMatch = queryWithoutOrder.match(/FROM\s+([^\s]+(?:\s+[^\s]+)*)/i);
    const whereMatch = queryWithoutOrder.match(/WHERE\s+(.*?)(?:\s+GROUP\s+BY|\s+ORDER\s+BY|$)/i);
    
    if (fromMatch) {
      const fromClause = fromMatch[1];
      const whereClause = whereMatch ? whereMatch[1] : '';
      
      // Criar query de contagem simples baseada na tabela principal
      let countQuery = `SELECT COUNT(*) as total FROM ${fromClause}`;
      if (whereClause) {
        countQuery += ` WHERE ${whereClause}`;
      }
      
      return countQuery;
    } else {
      // Fallback: usar subquery
      return `SELECT COUNT(*) as total FROM (${queryWithoutOrder}) as count_table`;
    }
  } else {
    // Para queries simples, tentar extrair a tabela principal
    const fromMatch = queryWithoutOrder.match(/FROM\s+([^\s]+(?:\s+[^\s]+)*)/i);
    if (fromMatch) {
      const fromClause = fromMatch[1];
      // Verificar se há JOINs
      if (queryWithoutOrder.toUpperCase().includes('JOIN')) {
        // Se há JOINs, usar subquery para evitar problemas
        return `SELECT COUNT(*) as total FROM (${queryWithoutOrder}) as count_table`;
      } else {
        // Query simples sem JOINs
        return `SELECT COUNT(*) as total FROM ${fromClause}`;
      }
    } else {
      // Fallback para queries complexas
      return `SELECT COUNT(*) as total FROM (${queryWithoutOrder}) as count_table`;
    }
  }
};

// Middleware para resposta paginada padronizada
const paginatedResponse = async (req, res, baseQuery, params = [], baseUrl) => {
  try {
    console.log('paginatedResponse Debug:', {
      baseQuery: baseQuery.substring(0, 100) + '...',
      params: params,
      baseUrl: baseUrl,
      hasGroupBy: baseQuery.toUpperCase().includes('GROUP BY')
    });
    
    const countQuery = createCountQuery(baseQuery);
    console.log('Count Query:', countQuery);
    
    // Verificar se é uma query complexa (com GROUP BY)
    if (baseQuery.toUpperCase().includes('GROUP BY')) {
      console.log('Query complexa detectada, usando abordagem alternativa');
      
      // Para queries com GROUP BY, usar uma abordagem mais simples
      const pagination = req.pagination;
      
      // Executar query principal com paginação
      const { query, params: paginatedParams } = pagination.applyPagination(baseQuery, params);
      const items = await executeQuery(query, paginatedParams);
      
      // Para queries com GROUP BY, estimar o total baseado no número de itens retornados
      // Se temos menos itens que o limite, sabemos que é a última página
      const estimatedTotal = items.length < pagination.limit ? 
        (pagination.page - 1) * pagination.limit + items.length : 
        pagination.page * pagination.limit + 100; // Estimativa conservadora
      
      // Gerar metadados de paginação
      const queryParams = { ...req.query };
      delete queryParams.page;
      delete queryParams.limit;
      
      const meta = pagination.generateMeta(estimatedTotal, baseUrl, queryParams);
      
      return {
        success: true,
        data: items,
        meta
      };
    } else {
      // Para queries simples, usar a abordagem normal
      const { items, meta } = await applyPagination(req, res, baseQuery, countQuery, params, baseUrl);
      
      return {
        success: true,
        data: items,
        meta
      };
    }
  } catch (error) {
    console.error('Erro na resposta paginada:', error);
    console.error('Query que causou erro:', baseQuery);
    console.error('Parâmetros:', params);
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
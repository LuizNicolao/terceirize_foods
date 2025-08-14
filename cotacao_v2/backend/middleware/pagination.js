/**
 * Middleware de Paginação
 * Adiciona funcionalidade de paginação automática nas respostas
 */

const paginationMiddleware = (req, res, next) => {
  // Extrair parâmetros de paginação da query
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  
  // Validar parâmetros
  if (page < 1) {
    return res.status(400).json({
      success: false,
      message: 'Página deve ser maior que 0'
    });
  }
  
  if (limit < 1 || limit > 100) {
    return res.status(400).json({
      success: false,
      message: 'Limite deve estar entre 1 e 100'
    });
  }
  
  // Adicionar informações de paginação ao request
  req.pagination = {
    page,
    limit,
    offset
  };
  
  // Sobrescrever o método res.json para adicionar metadados de paginação
  const originalJson = res.json;
  
  res.json = function(data) {
    // Se a resposta já tem metadados de paginação, não adicionar novamente
    if (data && data.pagination) {
      return originalJson.call(this, data);
    }
    
    // Adicionar metadados de paginação
    const response = {
      success: true,
      data: data,
      pagination: {
        page: req.pagination.page,
        limit: req.pagination.limit,
        total: data.length || 0,
        totalPages: Math.ceil((data.length || 0) / req.pagination.limit),
        hasNext: (req.pagination.page * req.pagination.limit) < (data.length || 0),
        hasPrev: req.pagination.page > 1
      }
    };
    
    return originalJson.call(this, response);
  };
  
  next();
};

module.exports = {
  paginationMiddleware
};

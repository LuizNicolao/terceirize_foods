/**
 * Middleware para padronizar respostas da API
 * Implementa padrões RESTful com status codes consistentes
 */

// Status codes padronizados
const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

// Função para criar resposta padronizada
const createResponse = (success, data = null, message = '', errors = null, meta = null) => {
  
  const response = {
    success,
    message,
    timestamp: new Date().toISOString()
  };

  if (data !== null) {
    response.data = data;
  }

  if (errors !== null) {
    response.errors = errors;
  }

  if (meta !== null) {
    response.meta = meta;
  }
  
  return response;
};

// Middleware para respostas de sucesso
const successResponse = (res, data = null, message = 'Operação realizada com sucesso', statusCode = STATUS_CODES.OK, meta = null) => {
  
  const response = createResponse(true, data, message, null, meta);
  
  return res.status(statusCode).json(response);
};

// Middleware para respostas de erro
const errorResponse = (res, message = 'Erro interno do servidor', statusCode = STATUS_CODES.INTERNAL_SERVER_ERROR, errors = null) => {
  const response = createResponse(false, null, message, errors);
  return res.status(statusCode).json(response);
};

// Middleware para respostas de validação
const validationResponse = (res, errors, message = 'Dados inválidos') => {
  return errorResponse(res, message, STATUS_CODES.UNPROCESSABLE_ENTITY, errors);
};

// Middleware para respostas de não encontrado
const notFoundResponse = (res, message = 'Recurso não encontrado') => {
  return errorResponse(res, message, STATUS_CODES.NOT_FOUND);
};

// Middleware para respostas de conflito
const conflictResponse = (res, message = 'Conflito de dados') => {
  return errorResponse(res, message, STATUS_CODES.CONFLICT);
};

// Middleware para respostas de não autorizado
const unauthorizedResponse = (res, message = 'Não autorizado') => {
  return errorResponse(res, message, STATUS_CODES.UNAUTHORIZED);
};

// Middleware para respostas de proibido
const forbiddenResponse = (res, message = 'Acesso negado') => {
  return errorResponse(res, message, STATUS_CODES.FORBIDDEN);
};

// Middleware para capturar erros assíncronos
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Middleware para tratamento global de erros
const errorHandler = (err, req, res, next) => {
  console.error('Erro na API:', err);

  // Erros de validação do express-validator
  if (err.name === 'ValidationError') {
    return validationResponse(res, err.errors);
  }

  // Erros de JWT
  if (err.name === 'JsonWebTokenError') {
    return unauthorizedResponse(res, 'Token inválido');
  }

  if (err.name === 'TokenExpiredError') {
    return unauthorizedResponse(res, 'Token expirado');
  }

  // Erros de banco de dados
  if (err.code === 'ER_DUP_ENTRY') {
    return conflictResponse(res, 'Dados duplicados');
  }

  // Erro genérico
  return errorResponse(res, 'Erro interno do servidor');
};

// Funções de formatação para compatibilidade
const formatarResposta = (res, statusCode, data, message = 'Operação realizada com sucesso') => {
  return successResponse(res, data, message, statusCode);
};

const formatarErro = (res, statusCode, message = 'Erro interno do servidor') => {
  return errorResponse(res, message, statusCode);
};

// Middlewares de resposta criados

module.exports = {
  STATUS_CODES,
  successResponse,
  errorResponse,
  validationResponse,
  notFoundResponse,
  conflictResponse,
  unauthorizedResponse,
  forbiddenResponse,
  asyncHandler,
  errorHandler,
  formatarResposta,
  formatarErro
};

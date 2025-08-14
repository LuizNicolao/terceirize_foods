/**
 * Middleware de Resposta Padronizada
 * Padroniza todas as respostas da API com status codes e estrutura consistentes
 */

const responseMiddleware = (req, res, next) => {
  // Métodos de resposta padronizados
  res.success = function(data, message = 'Operação realizada com sucesso', statusCode = 200) {
    return this.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  };

  res.created = function(data, message = 'Recurso criado com sucesso') {
    return this.success(data, message, 201);
  };

  res.noContent = function(message = 'Operação realizada com sucesso') {
    return this.status(204).json({
      success: true,
      message,
      timestamp: new Date().toISOString()
    });
  };

  res.badRequest = function(message = 'Dados inválidos', errors = null) {
    const response = {
      success: false,
      message,
      timestamp: new Date().toISOString()
    };

    if (errors) {
      response.errors = errors;
    }

    return this.status(400).json(response);
  };

  res.unauthorized = function(message = 'Não autorizado') {
    return this.status(401).json({
      success: false,
      message,
      timestamp: new Date().toISOString()
    });
  };

  res.forbidden = function(message = 'Acesso negado') {
    return this.status(403).json({
      success: false,
      message,
      timestamp: new Date().toISOString()
    });
  };

  res.notFound = function(message = 'Recurso não encontrado') {
    return this.status(404).json({
      success: false,
      message,
      timestamp: new Date().toISOString()
    });
  };

  res.conflict = function(message = 'Conflito de dados') {
    return this.status(409).json({
      success: false,
      message,
      timestamp: new Date().toISOString()
    });
  };

  res.unprocessableEntity = function(message = 'Entidade não processável', errors = null) {
    const response = {
      success: false,
      message,
      timestamp: new Date().toISOString()
    };

    if (errors) {
      response.errors = errors;
    }

    return this.status(422).json(response);
  };

  res.tooManyRequests = function(message = 'Muitas requisições') {
    return this.status(429).json({
      success: false,
      message,
      timestamp: new Date().toISOString()
    });
  };

  res.internalError = function(message = 'Erro interno do servidor', error = null) {
    const response = {
      success: false,
      message,
      timestamp: new Date().toISOString()
    };

    if (error && process.env.NODE_ENV === 'development') {
      response.error = error;
    }

    return this.status(500).json(response);
  };

  res.serviceUnavailable = function(message = 'Serviço indisponível') {
    return this.status(503).json({
      success: false,
      message,
      timestamp: new Date().toISOString()
    });
  };

  next();
};

module.exports = {
  responseMiddleware
};

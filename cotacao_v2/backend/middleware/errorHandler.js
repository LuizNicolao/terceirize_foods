/**
 * Middleware de Tratamento de Erros
 * Padroniza o tratamento de erros em toda a aplicação
 */

const errorHandler = (err, req, res, next) => {
  console.error('Erro capturado:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Erros de validação (Yup)
  if (err.name === 'ValidationError') {
    const errors = err.inner.map(error => ({
      field: error.path,
      message: error.message,
      value: error.value
    }));

    return res.unprocessableEntity('Dados inválidos', errors);
  }

  // Erros de autenticação JWT
  if (err.name === 'JsonWebTokenError') {
    return res.unauthorized('Token inválido');
  }

  if (err.name === 'TokenExpiredError') {
    return res.unauthorized('Token expirado');
  }

  // Erros de banco de dados
  if (err.code === 'ER_DUP_ENTRY') {
    return res.conflict('Dados duplicados');
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.badRequest('Referência inválida');
  }

  if (err.code === 'ER_ROW_IS_REFERENCED_2') {
    return res.conflict('Não é possível excluir este item pois está sendo usado');
  }

  // Erros de sintaxe SQL
  if (err.code === 'ER_PARSE_ERROR') {
    return res.internalError('Erro de sintaxe no banco de dados');
  }

  // Erros de conexão com banco
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    return res.serviceUnavailable('Serviço de banco de dados indisponível');
  }

  // Erros de timeout
  if (err.code === 'ETIMEDOUT') {
    return res.serviceUnavailable('Timeout na operação');
  }

  // Erros de limite de requisições
  if (err.status === 429) {
    return res.tooManyRequests('Muitas requisições. Tente novamente em alguns minutos.');
  }

  // Erros de arquivo não encontrado
  if (err.code === 'ENOENT') {
    return res.notFound('Arquivo não encontrado');
  }

  // Erros de permissão
  if (err.code === 'EACCES') {
    return res.forbidden('Permissão negada');
  }

  // Erros de memória
  if (err.code === 'ENOMEM') {
    return res.internalError('Erro de memória do servidor');
  }

  // Erro padrão para erros não mapeados
  const errorMessage = process.env.NODE_ENV === 'development' 
    ? err.message 
    : 'Erro interno do servidor';

  const errorDetails = process.env.NODE_ENV === 'development' 
    ? {
        stack: err.stack,
        name: err.name,
        code: err.code
      }
    : null;

  return res.internalError(errorMessage, errorDetails);
};

// Middleware para capturar erros assíncronos
const asyncErrorHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Middleware para capturar erros de rotas não encontradas
const notFoundHandler = (req, res) => {
  return res.notFound(`Rota ${req.method} ${req.originalUrl} não encontrada`);
};

module.exports = {
  errorHandler,
  asyncErrorHandler,
  notFoundHandler
};

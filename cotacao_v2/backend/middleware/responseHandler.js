const responseHandler = (req, res, next) => {
  // Sucesso
  res.success = (data, message = 'Operação realizada com sucesso', statusCode = 200) => {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  };

  // Erro
  res.error = (message = 'Erro interno do servidor', statusCode = 500, errors = null) => {
    const response = {
      success: false,
      message,
      timestamp: new Date().toISOString()
    };

    if (errors) {
      response.errors = errors;
    }

    return res.status(statusCode).json(response);
  };

  // Criado
  res.created = (data, message = 'Recurso criado com sucesso') => {
    return res.success(data, message, 201);
  };

  // Não encontrado
  res.notFound = (message = 'Recurso não encontrado') => {
    return res.error(message, 404);
  };

  // Não autorizado
  res.unauthorized = (message = 'Não autorizado') => {
    return res.error(message, 401);
  };

  // Proibido
  res.forbidden = (message = 'Acesso negado') => {
    return res.error(message, 403);
  };

  // Dados inválidos
  res.badRequest = (message = 'Dados inválidos', errors = null) => {
    return res.error(message, 400, errors);
  };

  // Conflito
  res.conflict = (message = 'Conflito de dados') => {
    return res.error(message, 409);
  };

  next();
};

module.exports = responseHandler;

/**
 * Middleware Universal de Validação
 * Trata erros de validação de forma reutilizável em todas as rotas
 */

const { validationResult } = require('express-validator');

/**
 * Cria um handler de validação simples
 * @param {string} entityType - Tipo da entidade (opcional, para logs)
 * @returns {Function} - Middleware de validação
 */
const createEntityValidationHandler = (entityType = 'entity') => {
  return (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Formatar erros de forma mais legível
      const formattedErrors = errors.array().map(error => ({
        field: error.path || error.param,
        message: error.msg,
        value: error.value
      }));
      
      return res.status(422).json({
        success: false,
        message: 'Dados inválidos',
        errors: formattedErrors,
        rawErrors: errors.array()
      });
    }
    next();
  };
};

module.exports = {
  createEntityValidationHandler
};

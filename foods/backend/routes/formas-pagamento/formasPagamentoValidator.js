/**
 * Validações específicas para Formas de Pagamento
 * Implementa validações usando express-validator
 */

const { body, param, query } = require('express-validator');
const { createEntityValidationHandler } = require('../../middleware/validationHandler');

// Criar handler de validação específico para formas de pagamento
const handleValidationErrors = createEntityValidationHandler('formas-pagamento');

// Validações comuns
const commonValidations = {
  // Validação de ID numérico
  id: param('id')
    .isInt({ min: 1 })
    .withMessage('ID deve ser um número inteiro positivo'),

  // Validação de busca
  search: query('search')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Termo de busca deve ter entre 1 e 100 caracteres'),

  // Validação de paginação
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Página deve ser um número inteiro positivo'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limite deve ser um número entre 1 e 100')
  ]
};

// Validações específicas para Formas de Pagamento
const formasPagamentoValidations = {
  create: [
    body('nome')
      .trim()
      .notEmpty()
      .withMessage('O nome da forma de pagamento é obrigatório')
      .isLength({ min: 1, max: 100 })
      .withMessage('O nome deve ter entre 1 e 100 caracteres'),
    body('descricao')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('A descrição deve ter no máximo 1000 caracteres'),
    body('prazo_padrao')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 50 })
      .withMessage('O prazo padrão deve ter no máximo 50 caracteres'),
    body('ativo')
      .optional()
      .isBoolean()
      .withMessage('Ativo deve ser um valor booleano')
      .toBoolean(),
    handleValidationErrors
  ],

  update: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID deve ser um número inteiro positivo'),
    body('nome')
      .trim()
      .notEmpty()
      .withMessage('O nome da forma de pagamento é obrigatório')
      .isLength({ min: 1, max: 100 })
      .withMessage('O nome deve ter entre 1 e 100 caracteres'),
    body('descricao')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('A descrição deve ter no máximo 1000 caracteres'),
    body('prazo_padrao')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 50 })
      .withMessage('O prazo padrão deve ter no máximo 50 caracteres'),
    body('ativo')
      .optional()
      .isBoolean()
      .withMessage('Ativo deve ser um valor booleano')
      .toBoolean(),
    handleValidationErrors
  ]
};

module.exports = {
  formasPagamentoValidations,
  commonValidations,
  handleValidationErrors
};


/**
 * Validações específicas para Prazos de Pagamento
 * Implementa validações usando express-validator
 */

const { body, param, query } = require('express-validator');
const { createEntityValidationHandler } = require('../../middleware/validationHandler');

// Criar handler de validação específico para prazos de pagamento
const handleValidationErrors = createEntityValidationHandler('prazos-pagamento');

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

// Validações específicas para Prazos de Pagamento
const prazosPagamentoValidations = {
  create: [
    body('nome')
      .trim()
      .notEmpty()
      .withMessage('O nome do prazo de pagamento é obrigatório')
      .isLength({ min: 1, max: 100 })
      .withMessage('O nome deve ter entre 1 e 100 caracteres'),
    body('dias')
      .notEmpty()
      .withMessage('O número de dias é obrigatório')
      .isInt({ min: 0 })
      .withMessage('O número de dias deve ser um número inteiro não negativo'),
    body('parcelas')
      .optional()
      .isInt({ min: 1, max: 12 })
      .withMessage('O número de parcelas deve ser entre 1 e 12'),
    body('intervalo_dias')
      .optional()
      .isInt({ min: 1 })
      .withMessage('O intervalo entre parcelas deve ser um número inteiro positivo'),
    body('descricao')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('A descrição deve ter no máximo 1000 caracteres'),
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
      .withMessage('O nome do prazo de pagamento é obrigatório')
      .isLength({ min: 1, max: 100 })
      .withMessage('O nome deve ter entre 1 e 100 caracteres'),
    body('dias')
      .notEmpty()
      .withMessage('O número de dias é obrigatório')
      .isInt({ min: 0 })
      .withMessage('O número de dias deve ser um número inteiro não negativo'),
    body('parcelas')
      .optional()
      .isInt({ min: 1, max: 12 })
      .withMessage('O número de parcelas deve ser entre 1 e 12'),
    body('intervalo_dias')
      .optional()
      .isInt({ min: 1 })
      .withMessage('O intervalo entre parcelas deve ser um número inteiro positivo'),
    body('descricao')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('A descrição deve ter no máximo 1000 caracteres'),
    body('ativo')
      .optional()
      .isBoolean()
      .withMessage('Ativo deve ser um valor booleano')
      .toBoolean(),
    handleValidationErrors
  ]
};

module.exports = {
  prazosPagamentoValidations,
  commonValidations,
  handleValidationErrors
};


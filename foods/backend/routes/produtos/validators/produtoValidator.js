/**
 * Validador Principal de Produtos
 * Combina todos os módulos de validação
 */

const { param, query } = require('express-validator');
const { createEntityValidationHandler } = require('../../../middleware/validationHandler');
const { basicInfoValidations } = require('./basicInfoValidator');
const { classificationValidations } = require('./classificationValidator');
const { dimensionsValidations } = require('./dimensionsValidator');
const { taxationValidations } = require('./taxationValidator');
const { documentsValidations } = require('./documentsValidator');
const { referencesValidations } = require('./referencesValidator');

// Criar handler de validação específico para produtos
const handleValidationErrors = createEntityValidationHandler('produtos');

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

// Validações específicas para produtos
const produtoValidations = {
  create: [
    ...basicInfoValidations,
    ...classificationValidations,
    ...dimensionsValidations,
    ...taxationValidations,
    ...documentsValidations,
    ...referencesValidations,
    handleValidationErrors
  ],

  update: [
    commonValidations.id,
    ...basicInfoValidations.map(validation => validation.optional()),
    ...classificationValidations.map(validation => validation.optional()),
    ...dimensionsValidations.map(validation => validation.optional()),
    ...taxationValidations.map(validation => validation.optional()),
    ...documentsValidations.map(validation => validation.optional()),
    ...referencesValidations.map(validation => validation.optional()),
    handleValidationErrors
  ]
};

module.exports = {
  produtoValidations,
  commonValidations,
  handleValidationErrors
};

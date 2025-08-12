/**
 * Validações específicas para Unidades
 * Implementa validações usando express-validator
 */

const { body } = require('express-validator');
const { commonValidations, handleValidationErrors } = require('../../middleware/validation');

// Validações específicas para unidades
const unidadeValidations = {
  create: [
    body('nome')
      .isLength({ min: 2, max: 100 })
      .withMessage('Nome deve ter entre 2 e 100 caracteres')
      .trim(),
    body('sigla')
      .isLength({ min: 1, max: 10 })
      .withMessage('Sigla deve ter entre 1 e 10 caracteres')
      .trim(),
    body('status')
      .optional()
      .isIn([0, 1])
      .withMessage('Status deve ser 0 (inativo) ou 1 (ativo)'),
    handleValidationErrors
  ],

  update: [
    commonValidations.id,
    body('nome')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Nome deve ter entre 2 e 100 caracteres')
      .trim(),
    body('sigla')
      .optional()
      .isLength({ min: 1, max: 10 })
      .withMessage('Sigla deve ter entre 1 e 10 caracteres')
      .trim(),
    body('status')
      .optional()
      .isIn([0, 1])
      .withMessage('Status deve ser 0 (inativo) ou 1 (ativo)'),
    handleValidationErrors
  ]
};

module.exports = {
  unidadeValidations,
  commonValidations,
  handleValidationErrors
};

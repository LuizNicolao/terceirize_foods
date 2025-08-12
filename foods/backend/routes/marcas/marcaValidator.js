/**
 * Validações específicas para Marcas
 * Implementa validações usando express-validator
 */

const { body } = require('express-validator');
const { commonValidations, handleValidationErrors } = require('../../middleware/validation');

// Validações específicas para marcas
const marcaValidations = {
  create: [
    body('marca')
      .isLength({ min: 2, max: 100 })
      .withMessage('Marca deve ter entre 2 e 100 caracteres')
      .matches(/^[a-zA-ZÀ-ÿ0-9\s\-\.]+$/)
      .withMessage('Marca deve conter apenas letras, números, espaços, hífens e pontos')
      .trim(),
    body('fabricante')
      .isLength({ min: 2, max: 100 })
      .withMessage('Fabricante deve ter entre 2 e 100 caracteres')
      .matches(/^[a-zA-ZÀ-ÿ0-9\s\-\.]+$/)
      .withMessage('Fabricante deve conter apenas letras, números, espaços, hífens e pontos')
      .trim(),
    body('status')
      .optional()
      .isIn([0, 1])
      .withMessage('Status deve ser 0 (inativo) ou 1 (ativo)'),
    handleValidationErrors
  ],

  update: [
    commonValidations.id,
    body('marca')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Marca deve ter entre 2 e 100 caracteres')
      .matches(/^[a-zA-ZÀ-ÿ0-9\s\-\.]+$/)
      .withMessage('Marca deve conter apenas letras, números, espaços, hífens e pontos')
      .trim(),
    body('fabricante')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Fabricante deve ter entre 2 e 100 caracteres')
      .matches(/^[a-zA-ZÀ-ÿ0-9\s\-\.]+$/)
      .withMessage('Fabricante deve conter apenas letras, números, espaços, hífens e pontos')
      .trim(),
    body('status')
      .optional()
      .isIn([0, 1])
      .withMessage('Status deve ser 0 (inativo) ou 1 (ativo)'),
    handleValidationErrors
  ]
};

module.exports = {
  marcaValidations,
  commonValidations,
  handleValidationErrors
};

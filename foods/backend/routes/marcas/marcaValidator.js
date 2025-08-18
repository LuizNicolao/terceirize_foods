/**
 * Validações específicas para Marcas
 * Implementa validações usando express-validator
 */

const { body, param, query } = require('express-validator');
const { createEntityValidationHandler } = require('../../middleware/validationHandler');

// Criar handler de validação específico para marcas
const handleValidationErrors = createEntityValidationHandler('marcas');

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

// Validações específicas para marcas
const marcaValidations = {
  create: [
    body('marca')
      .notEmpty()
      .withMessage('Marca é obrigatória')
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
      .isIn([0, 1, '0', '1'])
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
      .isIn([0, 1, '0', '1'])
      .withMessage('Status deve ser 0 (inativo) ou 1 (ativo)'),
    handleValidationErrors
  ]
};

module.exports = {
  marcaValidations,
  commonValidations,
  handleValidationErrors
};

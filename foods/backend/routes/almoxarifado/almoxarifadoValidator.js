/**
 * Validações específicas para Almoxarifado
 * Implementa validações usando express-validator
 */

const { body, param, query } = require('express-validator');
const { createEntityValidationHandler } = require('../../middleware/validationHandler');

// Criar handler de validação específico para almoxarifado
const handleValidationErrors = createEntityValidationHandler('almoxarifado');

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

// Validações específicas para almoxarifado
const almoxarifadoValidations = {
  create: [
    body('nome')
      .isLength({ min: 2, max: 200 })
      .withMessage('Nome deve ter entre 2 e 200 caracteres')
      .trim(),
    body('codigo')
      .optional()
      .isLength({ min: 1, max: 50 })
      .withMessage('Código deve ter entre 1 e 50 caracteres')
      .trim(),
    body('filial_id')
      .isInt({ min: 1 })
      .withMessage('Filial é obrigatória e deve ser um ID válido'),
    body('centro_custo_id')
      .isInt({ min: 1 })
      .withMessage('Centro de Custo é obrigatório e deve ser um ID válido'),
    body('observacoes')
      .optional()
      .isLength({ max: 2000 })
      .withMessage('Observações devem ter no máximo 2000 caracteres')
      .trim(),
    body('status')
      .optional()
      .isIn([0, 1, '0', '1'])
      .withMessage('Status deve ser 0 (inativo) ou 1 (ativo)'),
    handleValidationErrors
  ],

  update: [
    commonValidations.id,
    body('nome')
      .optional()
      .isLength({ min: 2, max: 200 })
      .withMessage('Nome deve ter entre 2 e 200 caracteres')
      .trim(),
    body('codigo')
      .optional()
      .isLength({ min: 1, max: 50 })
      .withMessage('Código deve ter entre 1 e 50 caracteres')
      .trim(),
    body('filial_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Filial deve ser um ID válido'),
    body('centro_custo_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Centro de Custo deve ser um ID válido'),
    body('observacoes')
      .optional()
      .isLength({ max: 2000 })
      .withMessage('Observações devem ter no máximo 2000 caracteres')
      .trim(),
    body('status')
      .optional()
      .isIn([0, 1, '0', '1'])
      .withMessage('Status deve ser 0 (inativo) ou 1 (ativo)'),
    handleValidationErrors
  ]
};

module.exports = {
  almoxarifadoValidations,
  commonValidations,
  handleValidationErrors
};


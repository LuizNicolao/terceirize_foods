/**
 * Validador de Almoxarifados para Unidades Escolares
 * Implementa validações específicas para almoxarifados de unidades escolares
 */

const { body, param, query } = require('express-validator');
const { validateRequest } = require('../../middleware/validation');

// Validações para criação de almoxarifado
const createAlmoxarifadoValidation = [
  body('nome')
    .trim()
    .notEmpty()
    .withMessage('O nome do almoxarifado é obrigatório')
    .isLength({ min: 2, max: 100 })
    .withMessage('O nome do almoxarifado deve ter entre 2 e 100 caracteres')
    .matches(/^[a-zA-Z0-9\s\-_\.]+$/)
    .withMessage('O nome do almoxarifado contém caracteres inválidos'),
  validateRequest
];

// Validações para atualização de almoxarifado
const updateAlmoxarifadoValidation = [
  body('nome')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('O nome do almoxarifado não pode estar vazio')
    .isLength({ min: 2, max: 100 })
    .withMessage('O nome do almoxarifado deve ter entre 2 e 100 caracteres')
    .matches(/^[a-zA-Z0-9\s\-_\.]+$/)
    .withMessage('O nome do almoxarifado contém caracteres inválidos'),
  body('status')
    .optional()
    .isIn([0, 1, '0', '1', true, false])
    .withMessage('O status deve ser 0 (inativo) ou 1 (ativo)'),
  validateRequest
];

// Validações para adição de item ao almoxarifado
const addItemAlmoxarifadoValidation = [
  body('produto_id')
    .notEmpty()
    .withMessage('O ID do produto é obrigatório')
    .isInt({ min: 1 })
    .withMessage('O ID do produto deve ser um número inteiro positivo'),
  body('quantidade')
    .notEmpty()
    .withMessage('A quantidade é obrigatória')
    .isFloat({ min: 0.001 })
    .withMessage('A quantidade deve ser um número positivo maior que zero'),
  validateRequest
];

// Validações para parâmetros de ID
const idValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('O ID deve ser um número inteiro positivo'),
  validateRequest
];

const unidadeEscolarIdValidation = [
  param('unidadeEscolarId')
    .isInt({ min: 1 })
    .withMessage('O ID da unidade escolar deve ser um número inteiro positivo'),
  validateRequest
];

const almoxarifadoIdValidation = [
  param('almoxarifadoId')
    .isInt({ min: 1 })
    .withMessage('O ID do almoxarifado deve ser um número inteiro positivo'),
  validateRequest
];

const itemIdValidation = [
  param('itemId')
    .isInt({ min: 1 })
    .withMessage('O ID do item deve ser um número inteiro positivo'),
  validateRequest
];

// Validações para listagem com filtros
const listAlmoxarifadosValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('A página deve ser um número inteiro positivo'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('O limite deve ser um número entre 1 e 100'),
  query('search')
    .optional()
    .isLength({ max: 100 })
    .withMessage('O termo de busca deve ter no máximo 100 caracteres'),
  validateRequest
];

module.exports = {
  createAlmoxarifadoValidation,
  updateAlmoxarifadoValidation,
  addItemAlmoxarifadoValidation,
  idValidation,
  unidadeEscolarIdValidation,
  almoxarifadoIdValidation,
  itemIdValidation,
  listAlmoxarifadosValidation
};

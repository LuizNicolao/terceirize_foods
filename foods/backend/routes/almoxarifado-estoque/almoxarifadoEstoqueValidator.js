/**
 * Validações específicas para Almoxarifado Estoque
 * Implementa validações usando express-validator
 */

const { body, param, query } = require('express-validator');
const { createEntityValidationHandler } = require('../../middleware/validationHandler');

// Criar handler de validação específico para almoxarifado-estoque
const handleValidationErrors = createEntityValidationHandler('almoxarifado-estoque');

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

// Validações específicas para almoxarifado-estoque
const almoxarifadoEstoqueValidations = {
  create: [
    body('almoxarifado_id')
      .isInt({ min: 1 })
      .withMessage('Almoxarifado é obrigatório e deve ser um ID válido'),
    body('produto_generico_id')
      .isInt({ min: 1 })
      .withMessage('Produto Genérico é obrigatório e deve ser um ID válido'),
    body('quantidade_atual')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Quantidade atual deve ser um número positivo'),
    body('quantidade_reservada')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Quantidade reservada deve ser um número positivo'),
    body('valor_unitario_medio')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Valor unitário médio deve ser um número positivo'),
    body('estoque_minimo')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Estoque mínimo deve ser um número positivo'),
    body('estoque_maximo')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Estoque máximo deve ser um número positivo'),
    body('lote')
      .optional()
      .isLength({ max: 50 })
      .withMessage('Lote deve ter no máximo 50 caracteres')
      .trim(),
    body('data_validade')
      .optional()
      .isISO8601()
      .withMessage('Data de validade deve ser uma data válida'),
    body('status')
      .optional()
      .isIn(['ATIVO', 'BLOQUEADO', 'INATIVO'])
      .withMessage('Status deve ser ATIVO, BLOQUEADO ou INATIVO'),
    body('observacoes')
      .optional()
      .isLength({ max: 2000 })
      .withMessage('Observações devem ter no máximo 2000 caracteres')
      .trim(),
    handleValidationErrors
  ],

  update: [
    commonValidations.id,
    body('almoxarifado_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Almoxarifado deve ser um ID válido'),
    body('produto_generico_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Produto Genérico deve ser um ID válido'),
    body('quantidade_atual')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Quantidade atual deve ser um número positivo'),
    body('quantidade_reservada')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Quantidade reservada deve ser um número positivo'),
    body('valor_unitario_medio')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Valor unitário médio deve ser um número positivo'),
    body('estoque_minimo')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Estoque mínimo deve ser um número positivo'),
    body('estoque_maximo')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Estoque máximo deve ser um número positivo'),
    body('lote')
      .optional()
      .isLength({ max: 50 })
      .withMessage('Lote deve ter no máximo 50 caracteres')
      .trim(),
    body('data_validade')
      .optional()
      .isISO8601()
      .withMessage('Data de validade deve ser uma data válida'),
    body('status')
      .optional()
      .isIn(['ATIVO', 'BLOQUEADO', 'INATIVO'])
      .withMessage('Status deve ser ATIVO, BLOQUEADO ou INATIVO'),
    body('observacoes')
      .optional()
      .isLength({ max: 2000 })
      .withMessage('Observações devem ter no máximo 2000 caracteres')
      .trim(),
    handleValidationErrors
  ]
};

module.exports = {
  almoxarifadoEstoqueValidations,
  commonValidations,
  handleValidationErrors
};


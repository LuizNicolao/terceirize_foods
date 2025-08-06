/**
 * Validações específicas para Produtos
 * Implementa validações usando express-validator
 */

const { body, param, query, validationResult } = require('express-validator');
const { validationResponse } = require('../../middleware/responseHandler');

// Middleware para capturar erros de validação
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return validationResponse(res, errors.array());
  }
  next();
};

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
    body('nome')
      .isLength({ min: 3, max: 200 })
      .withMessage('Nome do produto deve ter entre 3 e 200 caracteres'),
    body('descricao')
      .optional()
      .isLength({ min: 10, max: 1000 })
      .withMessage('Descrição deve ter entre 10 e 1000 caracteres'),
    body('codigo_barras')
      .optional()
      .isLength({ min: 8, max: 50 })
      .withMessage('Código de barras deve ter entre 8 e 50 caracteres'),
    body('fator_conversao')
      .optional()
      .isFloat({ min: 0.01 })
      .withMessage('Fator de conversão deve ser um número positivo'),
    body('preco_custo')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Preço de custo deve ser um número positivo'),
    body('preco_venda')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Preço de venda deve ser um número positivo'),
    body('estoque_atual')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Estoque atual deve ser um número inteiro positivo'),
    body('estoque_minimo')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Estoque mínimo deve ser um número inteiro positivo'),
    body('fornecedor_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Fornecedor deve ser selecionado'),
    body('grupo_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Grupo deve ser selecionado'),
    body('subgrupo_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Subgrupo deve ser selecionado'),
    body('unidade_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Unidade deve ser selecionada'),
    body('status')
      .optional()
      .isIn(['ativo', 'inativo'])
      .withMessage('Status deve ser ativo ou inativo'),
    handleValidationErrors
  ],

  update: [
    commonValidations.id,
    body('nome')
      .optional()
      .isLength({ min: 3, max: 200 })
      .withMessage('Nome do produto deve ter entre 3 e 200 caracteres'),
    body('descricao')
      .optional()
      .isLength({ min: 10, max: 1000 })
      .withMessage('Descrição deve ter entre 10 e 1000 caracteres'),
    body('codigo_barras')
      .optional()
      .isLength({ min: 8, max: 50 })
      .withMessage('Código de barras deve ter entre 8 e 50 caracteres'),
    body('fator_conversao')
      .optional()
      .isFloat({ min: 0.01 })
      .withMessage('Fator de conversão deve ser um número positivo'),
    body('preco_custo')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Preço de custo deve ser um número positivo'),
    body('preco_venda')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Preço de venda deve ser um número positivo'),
    body('estoque_atual')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Estoque atual deve ser um número inteiro positivo'),
    body('estoque_minimo')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Estoque mínimo deve ser um número inteiro positivo'),
    body('fornecedor_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Fornecedor deve ser selecionado'),
    body('grupo_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Grupo deve ser selecionado'),
    body('subgrupo_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Subgrupo deve ser selecionado'),
    body('unidade_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Unidade deve ser selecionada'),
    body('status')
      .optional()
      .isIn(['ativo', 'inativo'])
      .withMessage('Status deve ser ativo ou inativo'),
    handleValidationErrors
  ],

  estoque: [
    commonValidations.id,
    body('estoque_atual')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Estoque atual deve ser um número inteiro positivo'),
    body('estoque_minimo')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Estoque mínimo deve ser um número inteiro positivo'),
    handleValidationErrors
  ]
};

module.exports = {
  produtoValidations,
  commonValidations,
  handleValidationErrors
}; 
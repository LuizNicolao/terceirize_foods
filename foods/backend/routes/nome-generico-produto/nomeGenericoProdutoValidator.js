/**
 * Validações específicas para Nomes Genéricos de Produtos
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

// Validações específicas para nomes genéricos
const nomeGenericoProdutoValidations = [
  body('nome')
    .notEmpty()
    .withMessage('Nome é obrigatório')
    .isLength({ min: 2, max: 200 })
    .withMessage('Nome deve ter entre 2 e 200 caracteres')
    .trim(),
  
  body('grupo_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID do grupo deve ser um número inteiro positivo'),
  
  body('subgrupo_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID do subgrupo deve ser um número inteiro positivo'),
  
  body('classe_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID da classe deve ser um número inteiro positivo'),
  
  body('status')
    .optional()
    .isIn([0, 1, '0', '1'])
    .withMessage('Status deve ser 0 (inativo) ou 1 (ativo)'),
  
  handleValidationErrors
];

const nomeGenericoProdutoAtualizacaoValidations = [
  commonValidations.id,
  
  body('nome')
    .optional()
    .isLength({ min: 2, max: 200 })
    .withMessage('Nome deve ter entre 2 e 200 caracteres')
    .trim(),
  
  body('grupo_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID do grupo deve ser um número inteiro positivo'),
  
  body('subgrupo_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID do subgrupo deve ser um número inteiro positivo'),
  
  body('classe_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID da classe deve ser um número inteiro positivo'),
  
  body('status')
    .optional()
    .isIn([0, 1, '0', '1'])
    .withMessage('Status deve ser 0 (inativo) ou 1 (ativo)'),
  
  handleValidationErrors
];

module.exports = {
  commonValidations,
  nomeGenericoProdutoValidations,
  nomeGenericoProdutoAtualizacaoValidations,
  handleValidationErrors
};

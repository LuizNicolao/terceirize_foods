const { body, param, query } = require('express-validator');
const { createEntityValidationHandler } = require('../../middleware/validationHandler');

// Criar handler de validação específico para intolerâncias
const handleValidationErrors = createEntityValidationHandler('intolerancias');

// Validações comuns
const commonValidations = {
  id: [
    param('id').isInt({ min: 1 }).withMessage('ID deve ser um número inteiro positivo'),
    handleValidationErrors
  ],
  search: [
    query('search').optional().isString().trim().isLength({ max: 100 }).withMessage('Termo de busca deve ter no máximo 100 caracteres'),
    handleValidationErrors
  ],
  pagination: [
    query('page').optional().isInt({ min: 1 }).withMessage('Página deve ser um número inteiro positivo'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limite deve ser um número entre 1 e 100'),
    handleValidationErrors
  ]
};

// Validações para criação de intolerância
const intoleranciaValidations = [
  body('nome')
    .trim()
    .notEmpty().withMessage('Nome é obrigatório')
    .isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/).withMessage('Nome deve conter apenas letras e espaços'),
  
  body('status')
    .optional()
    .isIn(['ativo', 'inativo']).withMessage('Status deve ser "ativo" ou "inativo"'),
  
  handleValidationErrors
];

// Validações para atualização de intolerância
const intoleranciaAtualizacaoValidations = [
  body('nome')
    .optional()
    .trim()
    .notEmpty().withMessage('Nome não pode estar vazio')
    .isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/).withMessage('Nome deve conter apenas letras e espaços'),
  
  body('status')
    .optional()
    .isIn(['ativo', 'inativo']).withMessage('Status deve ser "ativo" ou "inativo"'),
  
  handleValidationErrors
];

module.exports = {
  intoleranciaValidations,
  intoleranciaAtualizacaoValidations,
  commonValidations
};

/**
 * Validações específicas para Ajudantes
 * Centraliza todas as validações relacionadas aos ajudantes
 */

const { body, param, query } = require('express-validator');
const { createEntityValidationHandler } = require('../../middleware/validationHandler');

// Criar handler de validação específico para ajudantes
const handleValidationErrors = createEntityValidationHandler('ajudantes');

// Validações comuns
const commonValidations = {
  // Validação de ID
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

// Validações específicas para ajudantes
const ajudanteValidations = {
  // Validações para criação de ajudante
  create: [
    body('nome')
      .notEmpty().withMessage('Nome é obrigatório')
      .isString().trim().isLength({ min: 3, max: 100 }).withMessage('Nome deve ter entre 3 e 100 caracteres'),
    
    body('cpf')
      .optional()
      .isString().trim().isLength({ max: 14 }).withMessage('CPF deve ter no máximo 14 caracteres'),
    
    body('telefone')
      .optional()
      .isString().trim().isLength({ max: 20 }).withMessage('Telefone deve ter no máximo 20 caracteres'),
    
    body('email')
      .optional()
      .isEmail().withMessage('Email deve ser válido'),
    
    body('endereco')
      .optional()
      .isString().trim().isLength({ max: 500 }).withMessage('Endereço deve ter no máximo 500 caracteres'),
    
    body('status')
      .notEmpty().withMessage('Status é obrigatório')
      .isIn(['ativo', 'inativo', 'ferias', 'licenca']).withMessage('Status deve ser ativo, inativo, ferias ou licenca'),
    
    body('data_admissao')
      .optional()
      .isString().withMessage('Data de admissão deve ser uma string válida'),
    
    body('observacoes')
      .optional()
      .isString().trim().isLength({ max: 500 }).withMessage('Observações devem ter no máximo 500 caracteres'),
    
    body('filial_id')
      .optional()
      .isInt({ min: 1 }).withMessage('ID da filial deve ser um número inteiro positivo'),
    
    handleValidationErrors
  ],

  // Validações para atualização de ajudante
  update: [
    param('id').isInt({ min: 1 }).withMessage('ID deve ser um número inteiro positivo'),
    
    body('nome')
      .optional()
      .isString().trim().isLength({ min: 3, max: 100 }).withMessage('Nome deve ter entre 3 e 100 caracteres'),
    
    body('cpf')
      .optional()
      .isString().trim().isLength({ max: 14 }).withMessage('CPF deve ter no máximo 14 caracteres'),
    
    body('telefone')
      .optional()
      .isString().trim().isLength({ max: 20 }).withMessage('Telefone deve ter no máximo 20 caracteres'),
    
    body('email')
      .optional()
      .isEmail().withMessage('Email deve ser válido'),
    
    body('endereco')
      .optional()
      .isString().trim().isLength({ max: 500 }).withMessage('Endereço deve ter no máximo 500 caracteres'),
    
    body('status')
      .optional()
      .isIn(['ativo', 'inativo', 'ferias', 'licenca']).withMessage('Status deve ser ativo, inativo, ferias ou licenca'),
    
    body('data_admissao')
      .optional()
      .isString().withMessage('Data de admissão deve ser uma string válida'),
    
    body('observacoes')
      .optional()
      .isString().trim().isLength({ max: 500 }).withMessage('Observações devem ter no máximo 500 caracteres'),
    
    body('filial_id')
      .optional()
      .isInt({ min: 1 }).withMessage('ID da filial deve ser um número inteiro positivo'),
    
    handleValidationErrors
  ]
};

module.exports = {
  ajudanteValidations,
  commonValidations
};

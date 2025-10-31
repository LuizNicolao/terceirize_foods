/**
 * Validações específicas para Tipo de Rota
 * Centraliza todas as validações relacionadas aos tipos de rota
 */

const { body, param, query } = require('express-validator');
const { createEntityValidationHandler } = require('../../middleware/validationHandler');

// Criar handler de validação específico para tipo_rota
const handleValidationErrors = createEntityValidationHandler('tipo_rota');

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

// Validações específicas para tipo de rota
const tipoRotaValidations = {
  // Validações para criação de tipo de rota
  create: [
    body('nome')
      .notEmpty().withMessage('Nome da rota é obrigatório')
      .isString().trim().isLength({ min: 2, max: 150 }).withMessage('Nome deve ter entre 2 e 150 caracteres'),
    
    body('filial_id')
      .notEmpty().withMessage('Filial é obrigatória')
      .isInt({ min: 1 }).withMessage('ID da filial deve ser um número inteiro positivo'),
    
    body('grupo_id')
      .notEmpty().withMessage('Grupo é obrigatório')
      .isInt({ min: 1 }).withMessage('ID do grupo deve ser um número inteiro positivo'),
    
    body('status')
      .optional()
      .isIn(['ativo', 'inativo']).withMessage('Status deve ser ativo ou inativo'),
    
    handleValidationErrors
  ],

  // Validações para atualização de tipo de rota
  update: [
    param('id').isInt({ min: 1 }).withMessage('ID deve ser um número inteiro positivo'),
    
    body('nome')
      .optional()
      .isString().trim().isLength({ min: 2, max: 150 }).withMessage('Nome deve ter entre 2 e 150 caracteres'),
    
    body('filial_id')
      .optional()
      .isInt({ min: 1 }).withMessage('ID da filial deve ser um número inteiro positivo'),
    
    body('grupo_id')
      .optional()
      .isInt({ min: 1 }).withMessage('ID do grupo deve ser um número inteiro positivo'),
    
    body('status')
      .optional()
      .isIn(['ativo', 'inativo']).withMessage('Status deve ser ativo ou inativo'),
    
    handleValidationErrors
  ]
};

module.exports = {
  tipoRotaValidations,
  commonValidations
};


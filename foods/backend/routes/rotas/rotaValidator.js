/**
 * Validações específicas para Rotas
 * Centraliza todas as validações relacionadas às rotas
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

// Validações específicas para rotas
const rotaValidations = {
  // Validações para criação de rota
  create: [
    body('nome')
      .notEmpty().withMessage('Nome da rota é obrigatório')
      .isString().trim().isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres'),
    
    body('codigo')
      .notEmpty().withMessage('Código da rota é obrigatório')
      .isString().trim().isLength({ min: 1, max: 20 }).withMessage('Código deve ter entre 1 e 20 caracteres'),
    
    body('tipo_rota')
      .notEmpty().withMessage('Tipo da rota é obrigatório')
      .isIn(['semanal', 'quinzenal', 'mensal', 'transferencia']).withMessage('Tipo deve ser semanal, quinzenal, mensal ou transferencia'),
    
    body('filial_id')
      .notEmpty().withMessage('Filial é obrigatória')
      .isInt({ min: 1 }).withMessage('ID da filial deve ser um número inteiro positivo'),
    
    body('status')
      .optional()
      .isIn(['ativo', 'inativo']).withMessage('Status deve ser ativo ou inativo'),
    
    body('observacoes')
      .optional()
      .isString().trim().isLength({ max: 500 }).withMessage('Observações devem ter no máximo 500 caracteres'),
    
    handleValidationErrors
  ],

  // Validações para atualização de rota
  update: [
    param('id').isInt({ min: 1 }).withMessage('ID deve ser um número inteiro positivo'),
    
    body('nome')
      .optional()
      .isString().trim().isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres'),
    
    body('codigo')
      .optional()
      .isString().trim().isLength({ min: 1, max: 20 }).withMessage('Código deve ter entre 1 e 20 caracteres'),
    
    body('tipo_rota')
      .optional()
      .isIn(['semanal', 'quinzenal', 'mensal', 'transferencia']).withMessage('Tipo deve ser semanal, quinzenal, mensal ou transferencia'),
    
    body('filial_id')
      .optional()
      .isInt({ min: 1 }).withMessage('ID da filial deve ser um número inteiro positivo'),
    
    body('status')
      .optional()
      .isIn(['ativo', 'inativo']).withMessage('Status deve ser ativo ou inativo'),
    
    body('observacoes')
      .optional()
      .isString().trim().isLength({ max: 500 }).withMessage('Observações devem ter no máximo 500 caracteres'),
    
    handleValidationErrors
  ]
};

module.exports = {
  rotaValidations,
  commonValidations,
  handleValidationErrors
};

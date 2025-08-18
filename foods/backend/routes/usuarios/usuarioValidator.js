/**
 * Validações específicas para Usuários
 * Implementa validações usando express-validator
 */

const { body, param, query } = require('express-validator');
const { createEntityValidationHandler } = require('../../middleware/validationHandler');

// Criar handler de validação específico para usuários
const handleValidationErrors = createEntityValidationHandler('usuarios');

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

// Validações específicas para usuários
const userValidations = {
  create: [
    body('nome')
      .notEmpty().withMessage('Nome é obrigatório')
      .isString().trim().isLength({ min: 3, max: 100 }).withMessage('Nome deve ter entre 3 e 100 caracteres'),
    
    body('email')
      .notEmpty().withMessage('Email é obrigatório')
      .isEmail().withMessage('Email deve ser válido'),
    
    body('senha')
      .notEmpty().withMessage('Senha é obrigatória')
      .isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
    
    body('nivel_de_acesso')
      .notEmpty().withMessage('Nível de acesso é obrigatório')
      .isIn(['I', 'II', 'III']).withMessage('Nível de acesso deve ser I, II ou III'),
    
    body('tipo_de_acesso')
      .notEmpty().withMessage('Tipo de acesso é obrigatório')
      .isIn(['administrador', 'coordenador', 'administrativo', 'gerente', 'supervisor'])
      .withMessage('Tipo de acesso inválido'),
    
    body('status')
      .optional()
      .isIn(['ativo', 'inativo', 'bloqueado']).withMessage('Status deve ser ativo, inativo ou bloqueado'),
    
    handleValidationErrors
  ],

  update: [
    param('id').isInt({ min: 1 }).withMessage('ID deve ser um número inteiro positivo'),
    
    body('nome')
      .optional()
      .isString().trim().isLength({ min: 3, max: 100 }).withMessage('Nome deve ter entre 3 e 100 caracteres'),
    
    body('email')
      .optional()
      .isEmail().withMessage('Email deve ser válido'),
    
    body('senha')
      .optional()
      .isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
    
    body('nivel_de_acesso')
      .optional()
      .isIn(['I', 'II', 'III']).withMessage('Nível de acesso deve ser I, II ou III'),
    
    body('tipo_de_acesso')
      .optional()
      .isIn(['administrador', 'coordenador', 'administrativo', 'gerente', 'supervisor'])
      .withMessage('Tipo de acesso inválido'),
    
    body('status')
      .optional()
      .isIn(['ativo', 'inativo', 'bloqueado']).withMessage('Status deve ser ativo, inativo ou bloqueado'),
    
    handleValidationErrors
  ]
};

module.exports = {
  userValidations,
  commonValidations
}; 
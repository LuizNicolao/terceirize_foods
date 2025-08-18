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
      .custom((value) => {
        if (typeof value === 'string') {
          const trimmed = value.trim();
          return trimmed.length >= 3 && trimmed.length <= 100;
        }
        return false;
      })
      .withMessage('Nome deve ter entre 3 e 100 caracteres'),
    
    body('email')
      .notEmpty().withMessage('Email é obrigatório')
      .custom((value) => {
        if (typeof value === 'string') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(value);
        }
        return false;
      })
      .withMessage('Email deve ser válido'),
    
    body('senha')
      .notEmpty().withMessage('Senha é obrigatória')
      .custom((value) => {
        if (typeof value === 'string') {
          return value.length >= 6;
        }
        return false;
      })
      .withMessage('Senha deve ter pelo menos 6 caracteres'),
    
    body('nivel_de_acesso')
      .notEmpty().withMessage('Nível de acesso é obrigatório')
      .custom((value) => {
        return ['I', 'II', 'III'].includes(value);
      })
      .withMessage('Nível de acesso deve ser I, II ou III'),
    
    body('tipo_de_acesso')
      .notEmpty().withMessage('Tipo de acesso é obrigatório')
      .custom((value) => {
        return ['administrador', 'coordenador', 'administrativo', 'gerente', 'supervisor'].includes(value);
      })
      .withMessage('Tipo de acesso inválido'),
    
    body('status')
      .optional()
      .custom((value) => {
        if (value === null || value === undefined || value === '') {
          return true; // Aceita valores vazios
        }
        return ['ativo', 'inativo', 'bloqueado'].includes(value);
      })
      .withMessage('Status deve ser ativo, inativo ou bloqueado'),
    
    handleValidationErrors
  ],

  update: [
    param('id').isInt({ min: 1 }).withMessage('ID deve ser um número inteiro positivo'),
    
    body('nome')
      .optional()
      .custom((value) => {
        if (value === null || value === undefined || value === '') {
          return true; // Aceita valores vazios
        }
        if (typeof value === 'string') {
          const trimmed = value.trim();
          return trimmed.length >= 3 && trimmed.length <= 100;
        }
        return false;
      })
      .withMessage('Nome deve ter entre 3 e 100 caracteres'),
    
    body('email')
      .optional()
      .custom((value) => {
        if (value === null || value === undefined || value === '') {
          return true; // Aceita valores vazios
        }
        if (typeof value === 'string') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(value);
        }
        return false;
      })
      .withMessage('Email deve ser válido'),
    
    body('senha')
      .optional()
      .custom((value) => {
        if (value === null || value === undefined || value === '') {
          return true; // Aceita valores vazios
        }
        if (typeof value === 'string') {
          return value.length >= 6;
        }
        return false;
      })
      .withMessage('Senha deve ter pelo menos 6 caracteres'),
    
    body('nivel_de_acesso')
      .optional()
      .custom((value) => {
        if (value === null || value === undefined || value === '') {
          return true; // Aceita valores vazios
        }
        return ['I', 'II', 'III'].includes(value);
      })
      .withMessage('Nível de acesso deve ser I, II ou III'),
    
    body('tipo_de_acesso')
      .optional()
      .custom((value) => {
        if (value === null || value === undefined || value === '') {
          return true; // Aceita valores vazios
        }
        return ['administrador', 'coordenador', 'administrativo', 'gerente', 'supervisor'].includes(value);
      })
      .withMessage('Tipo de acesso inválido'),
    
    body('status')
      .optional()
      .custom((value) => {
        if (value === null || value === undefined || value === '') {
          return true; // Aceita valores vazios
        }
        return ['ativo', 'inativo', 'bloqueado'].includes(value);
      })
      .withMessage('Status deve ser ativo, inativo ou bloqueado'),
    
    handleValidationErrors
  ]
};

module.exports = {
  userValidations,
  commonValidations
}; 
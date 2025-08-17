/**
 * Validações específicas para Usuários
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

// Validações específicas para usuários
const userValidations = {
  create: [
    body('nome')
      .isLength({ min: 3, max: 100 })
      .withMessage('Nome deve ter entre 3 e 100 caracteres')
      .trim(),
    body('email')
      .custom((value) => {
        if (value && value.trim() !== '') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            throw new Error('Email deve ser um email válido');
          }
        }
        return true;
      })
      .withMessage('Email deve ser um email válido'),
    body('senha')
      .isLength({ min: 6 })
      .withMessage('Senha deve ter pelo menos 6 caracteres'),
    body('nivel_de_acesso')
      .isIn(['I', 'II', 'III'])
      .withMessage('Nível de acesso deve ser I, II ou III'),
    body('tipo_de_acesso')
      .isIn(['administrador', 'coordenador', 'administrativo', 'gerente', 'supervisor'])
      .withMessage('Tipo de acesso inválido'),
    handleValidationErrors
  ],

  update: [
    commonValidations.id,
    body('nome')
      .optional()
      .isLength({ min: 3, max: 100 })
      .withMessage('Nome deve ter entre 3 e 100 caracteres')
      .trim(),
    body('email')
      .optional()
      .custom((value) => {
        if (value && value.trim() !== '') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            throw new Error('Email deve ser um email válido');
          }
        }
        return true;
      })
      .withMessage('Email deve ser um email válido'),
    body('nivel_de_acesso')
      .optional()
      .isIn(['I', 'II', 'III'])
      .withMessage('Nível de acesso deve ser I, II ou III'),
    body('tipo_de_acesso')
      .optional()
      .isIn(['administrador', 'coordenador', 'administrativo', 'gerente', 'supervisor'])
      .withMessage('Tipo de acesso inválido'),
    handleValidationErrors
  ]
};

module.exports = {
  userValidations,
  commonValidations,
  handleValidationErrors
}; 
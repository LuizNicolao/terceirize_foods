/**
 * Validadores para Usuários
 * Implementa validação com express-validator seguindo padrões do projeto
 */

const { body, param, query, validationResult } = require('express-validator');
const { validationResponse } = require('../../middleware/responseHandler');

// Validações para usuários
const userValidations = {
  // Validação para criação de usuário
  create: [
    body('email')
      .isEmail()
      .withMessage('Email deve ter um formato válido')
      .normalizeEmail()
      .isLength({ max: 255 })
      .withMessage('Email deve ter no máximo 255 caracteres'),
    
    body('nome')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Nome deve ter entre 2 e 100 caracteres')
      .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
      .withMessage('Nome deve conter apenas letras e espaços'),
    
    body('senha')
      .isLength({ min: 6 })
      .withMessage('Senha deve ter pelo menos 6 caracteres')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número'),
    
    body('tipo_usuario')
      .isIn(['Coordenacao', 'Supervisao', 'Nutricionista'])
      .withMessage('Tipo de usuário deve ser Coordenacao, Supervisao ou Nutricionista'),
    
    body('rota')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Rota deve ter no máximo 50 caracteres'),
    
    body('setor')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Setor deve ter no máximo 50 caracteres')
  ],

  // Validação para atualização de usuário
  update: [
    body('email')
      .optional()
      .isEmail()
      .withMessage('Email deve ter um formato válido')
      .normalizeEmail()
      .isLength({ max: 255 })
      .withMessage('Email deve ter no máximo 255 caracteres'),
    
    body('nome')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Nome deve ter entre 2 e 100 caracteres')
      .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
      .withMessage('Nome deve conter apenas letras e espaços'),
    
    body('senha')
      .optional()
      .isLength({ min: 6 })
      .withMessage('Senha deve ter pelo menos 6 caracteres')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número'),
    
    body('tipo_usuario')
      .optional()
      .isIn(['Coordenacao', 'Supervisao', 'Nutricionista'])
      .withMessage('Tipo de usuário deve ser Coordenacao, Supervisao ou Nutricionista'),
    
    body('rota')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Rota deve ter no máximo 50 caracteres'),
    
    body('setor')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Setor deve ter no máximo 50 caracteres'),
    
    body('ativo')
      .optional()
      .isBoolean()
      .withMessage('Status ativo deve ser verdadeiro ou falso')
  ],

  // Validação para parâmetro ID
  id: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID deve ser um número inteiro positivo')
  ],

  // Validação para busca por email
  email: [
    param('email')
      .isEmail()
      .withMessage('Email deve ter um formato válido')
      .normalizeEmail()
  ]
};

// Validações comuns
const commonValidations = {
  // Validação para paginação
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Página deve ser um número inteiro maior que 0'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limite deve ser um número inteiro entre 1 e 100')
  ],

  // Validação para busca
  search: [
    query('search')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Termo de busca deve ter no máximo 100 caracteres'),
    
    query('tipo_usuario')
      .optional()
      .isIn(['Coordenacao', 'Supervisao', 'Nutricionista'])
      .withMessage('Tipo de usuário inválido'),
    
    query('ativo')
      .optional()
      .isBoolean()
      .withMessage('Status ativo deve ser verdadeiro ou falso'),
    
    query('rota')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Rota deve ter no máximo 50 caracteres'),
    
    query('setor')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Setor deve ter no máximo 50 caracteres')
  ],

  // Validação para parâmetros de data
  dateRange: [
    query('data_inicio')
      .optional()
      .isISO8601()
      .withMessage('Data de início deve estar no formato ISO 8601 (YYYY-MM-DD)'),
    
    query('data_fim')
      .optional()
      .isISO8601()
      .withMessage('Data de fim deve estar no formato ISO 8601 (YYYY-MM-DD)')
  ]
};

// Middleware para processar resultados de validação
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value
    }));
    
    return validationResponse(res, formattedErrors);
  }
  
  next();
};

// Função para combinar validações com tratamento de erros
const validate = (validations) => {
  return [...validations, handleValidationErrors];
};

module.exports = {
  userValidations,
  commonValidations,
  handleValidationErrors,
  validate
};

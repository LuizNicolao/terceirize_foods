/**
 * Validações específicas para Ajudantes
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

// Validações específicas para ajudantes
const ajudanteValidations = {
  create: [
    body('nome')
      .notEmpty()
      .withMessage('Nome é obrigatório')
      .isLength({ min: 3, max: 100 })
      .withMessage('Nome deve ter entre 3 e 100 caracteres')
      .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
      .withMessage('Nome contém caracteres inválidos')
      .trim(),
    
    body('cpf')
      .optional()
      .custom((value) => {
        if (value && value.trim() !== '') {
          const cpfLimpo = value.replace(/\D/g, '');
          if (cpfLimpo.length < 9 || cpfLimpo.length > 14) {
            throw new Error('CPF deve ter entre 9 e 14 dígitos');
          }
        }
        return true;
      })
      .withMessage('CPF deve ter entre 9 e 14 dígitos'),
    
    body('telefone')
      .optional()
      .custom((value) => {
        if (value && value.trim() !== '') {
          const telefoneLimpo = value.replace(/\D/g, '');
          if (telefoneLimpo.length < 8 || telefoneLimpo.length > 15) {
            throw new Error('Telefone deve ter entre 8 e 15 dígitos');
          }
        }
        return true;
      })
      .withMessage('Telefone deve ter entre 8 e 15 dígitos'),
    
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
    
    body('endereco')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Endereço deve ter no máximo 500 caracteres')
      .trim(),
    
    body('status')
      .notEmpty()
      .withMessage('Status é obrigatório')
      .isIn(['ativo', 'inativo', 'ferias', 'licenca'])
      .withMessage('Status deve ser ativo, inativo, ferias ou licenca'),
    
    body('data_admissao')
      .optional()
      .custom((value) => {
        if (value) {
          const data = new Date(value);
          if (isNaN(data.getTime())) {
            throw new Error('Data de admissão deve ser uma data válida');
          }
        }
        return true;
      })
      .withMessage('Data de admissão deve ser uma data válida'),
    
    body('observacoes')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Observações deve ter no máximo 1000 caracteres')
      .trim(),
    
    body('filial_id')
      .optional()
      .custom((value) => {
        if (value !== null && value !== undefined && value !== '') {
          const numValue = parseInt(value);
          if (isNaN(numValue) || numValue < 1) {
            throw new Error('ID da filial deve ser um número inteiro válido maior que 0');
          }
        }
        return true;
      })
      .withMessage('ID da filial deve ser um número inteiro válido'),
    
    handleValidationErrors
  ],

  update: [
    commonValidations.id,
    
    body('nome')
      .optional()
      .isLength({ min: 3, max: 100 })
      .withMessage('Nome deve ter entre 3 e 100 caracteres')
      .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
      .withMessage('Nome contém caracteres inválidos')
      .trim(),
    
    body('cpf')
      .optional()
      .custom((value) => {
        if (value && value.trim() !== '') {
          const cpfLimpo = value.replace(/\D/g, '');
          if (cpfLimpo.length < 9 || cpfLimpo.length > 14) {
            throw new Error('CPF deve ter entre 9 e 14 dígitos');
          }
        }
        return true;
      })
      .withMessage('CPF deve ter entre 9 e 14 dígitos'),
    
    body('telefone')
      .optional()
      .custom((value) => {
        if (value && value.trim() !== '') {
          const telefoneLimpo = value.replace(/\D/g, '');
          if (telefoneLimpo.length < 8 || telefoneLimpo.length > 15) {
            throw new Error('Telefone deve ter entre 8 e 15 dígitos');
          }
        }
        return true;
      })
      .withMessage('Telefone deve ter entre 8 e 15 dígitos'),
    
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
    
    body('endereco')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Endereço deve ter no máximo 500 caracteres')
      .trim(),
    
    body('status')
      .optional()
      .isIn(['ativo', 'inativo', 'ferias', 'licenca'])
      .withMessage('Status deve ser ativo, inativo, ferias ou licenca'),
    
    body('data_admissao')
      .optional()
      .custom((value) => {
        if (value) {
          const data = new Date(value);
          if (isNaN(data.getTime())) {
            throw new Error('Data de admissão deve ser uma data válida');
          }
        }
        return true;
      })
      .withMessage('Data de admissão deve ser uma data válida'),
    
    body('observacoes')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Observações deve ter no máximo 1000 caracteres')
      .trim(),
    
    body('filial_id')
      .optional()
      .custom((value) => {
        if (value !== null && value !== undefined && value !== '') {
          const numValue = parseInt(value);
          if (isNaN(numValue) || numValue < 1) {
            throw new Error('ID da filial deve ser um número inteiro válido maior que 0');
          }
        }
        return true;
      })
      .withMessage('ID da filial deve ser um número inteiro válido'),
    
    handleValidationErrors
  ]
};

module.exports = {
  ajudanteValidations,
  commonValidations,
  handleValidationErrors
};

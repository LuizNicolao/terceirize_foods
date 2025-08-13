/**
 * Middleware de validação padronizado
 * Implementa validações consistentes usando express-validator
 */

const { body, param, query, validationResult } = require('express-validator');
const { validationResponse } = require('./responseHandler');

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
  ],

  // Validação de email
  email: body('email')
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

  // Validação de senha
  password: body('senha')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres'),

  // Validação de nome
  name: body('nome')
    .isLength({ min: 3, max: 100 })
    .withMessage('Nome deve ter entre 3 e 100 caracteres')
    .trim(),

  // Validação de telefone
  phone: body('telefone')
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

  // Validação de CNPJ
  cnpj: body('cnpj')
    .optional()
    .custom((value) => {
      if (value && value.trim() !== '') {
        const cnpjLimpo = value.replace(/\D/g, '');
        if (cnpjLimpo.length !== 14) {
          throw new Error('CNPJ deve ter 14 dígitos');
        }
      }
      return true;
    })
    .withMessage('CNPJ deve ter 14 dígitos'),

  // Validação de CEP
  cep: body('cep')
    .optional()
    .custom((value) => {
      if (value && value.trim() !== '') {
        const cepLimpo = value.replace(/\D/g, '');
        if (cepLimpo.length !== 8) {
          throw new Error('CEP deve ter 8 dígitos');
        }
      }
      return true;
    })
    .withMessage('CEP deve ter 8 dígitos'),

  // Validação de status
  status: body('status')
    .optional()
    .isIn(['ativo', 'inativo', 'bloqueado'])
    .withMessage('Status deve ser ativo, inativo ou bloqueado')
};

module.exports = {
  handleValidationErrors,
  commonValidations
};

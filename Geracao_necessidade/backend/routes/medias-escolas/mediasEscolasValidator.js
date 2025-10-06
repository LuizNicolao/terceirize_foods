/**
 * Validações para Médias por Escolas
 * Implementa validação com express-validator seguindo padrões do projeto
 */

const { body, param, query, validationResult } = require('express-validator');
const { validationResponse } = require('../../middleware/responseHandler');

const mediasEscolasValidations = {
  create: [
    body('escola_id').optional().isInt({ min: 1 }).withMessage('ID da escola deve ser um número inteiro positivo'),
    body('nome_escola').optional().trim().isLength({ min: 2, max: 255 }).withMessage('Nome da escola deve ter entre 2 e 255 caracteres'),
    body('rota').optional().trim().isLength({ max: 100 }).withMessage('Rota deve ter no máximo 100 caracteres'),
    body('media_lanche_manha').optional().isFloat({ min: 0 }).withMessage('Média do lanche da manhã deve ser um número positivo'),
    body('media_almoco').optional().isFloat({ min: 0 }).withMessage('Média do almoço deve ser um número positivo'),
    body('media_lanche_tarde').optional().isFloat({ min: 0 }).withMessage('Média do lanche da tarde deve ser um número positivo'),
    body('media_parcial').optional().isFloat({ min: 0 }).withMessage('Média parcial deve ser um número positivo'),
    body('media_eja').optional().isFloat({ min: 0 }).withMessage('Média EJA deve ser um número positivo')
  ],
  update: [
    body('escola_id').optional().isInt({ min: 1 }).withMessage('ID da escola deve ser um número inteiro positivo'),
    body('nome_escola').optional().trim().isLength({ min: 2, max: 255 }).withMessage('Nome da escola deve ter entre 2 e 255 caracteres'),
    body('rota').optional().trim().isLength({ max: 100 }).withMessage('Rota deve ter no máximo 100 caracteres'),
    body('media_lanche_manha').optional().isFloat({ min: 0 }).withMessage('Média do lanche da manhã deve ser um número positivo'),
    body('media_almoco').optional().isFloat({ min: 0 }).withMessage('Média do almoço deve ser um número positivo'),
    body('media_lanche_tarde').optional().isFloat({ min: 0 }).withMessage('Média do lanche da tarde deve ser um número positivo'),
    body('media_parcial').optional().isFloat({ min: 0 }).withMessage('Média parcial deve ser um número positivo'),
    body('media_eja').optional().isFloat({ min: 0 }).withMessage('Média EJA deve ser um número positivo'),
    body('ativo').optional().isBoolean().withMessage('Status ativo deve ser verdadeiro ou falso')
  ],
  id: [
    param('id').isInt({ min: 1 }).withMessage('ID deve ser um número inteiro positivo')
  ],
  escolaId: [
    param('escola_id').isInt({ min: 1 }).withMessage('ID da escola deve ser um número inteiro positivo')
  ]
};

const commonValidations = {
  pagination: [
    query('page').optional().isInt({ min: 1 }).withMessage('Página deve ser um número inteiro maior que 0'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limite deve ser um número inteiro entre 1 e 100')
  ],
  search: [
    query('search').optional().trim().isLength({ max: 100 }).withMessage('Termo de busca deve ter no máximo 100 caracteres'),
    query('rota').optional().trim().isLength({ max: 100 }).withMessage('Rota deve ter no máximo 100 caracteres'),
    query('ativo').optional().isBoolean().withMessage('Status ativo deve ser verdadeiro ou falso')
  ],
  dateRange: [
    query('data_inicio').optional().isISO8601().withMessage('Data de início deve estar no formato ISO 8601 (YYYY-MM-DD)'),
    query('data_fim').optional().isISO8601().withMessage('Data de fim deve estar no formato ISO 8601 (YYYY-MM-DD)')
  ]
};

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

const validate = (validations) => {
  return [...validations, handleValidationErrors];
};

module.exports = {
  mediasEscolasValidations,
  commonValidations,
  handleValidationErrors,
  validate
};

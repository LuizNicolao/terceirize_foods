/**
 * Validações específicas para Motoristas
 * Centraliza todas as validações relacionadas aos motoristas
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

// Validações específicas para motoristas
const motoristaValidations = {
  // Validações para criação de motorista
  create: [
    body('nome')
      .notEmpty().withMessage('Nome é obrigatório')
      .isString().trim().isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres'),
    
    body('cpf')
      .optional()
      .isString().trim().matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/).withMessage('CPF deve estar no formato 000.000.000-00'),
    
    body('cnh')
      .optional()
      .isString().trim().isLength({ min: 1, max: 20 }).withMessage('CNH deve ter entre 1 e 20 caracteres'),
    
    body('categoria_cnh')
      .optional()
      .isIn(['A', 'B', 'C', 'D', 'E', 'AB', 'AC', 'AD', 'AE', 'BC', 'BD', 'BE', 'CD', 'CE', 'DE']).withMessage('Categoria CNH deve ser uma das categorias válidas'),
    
    body('telefone')
      .optional()
      .isString().trim().matches(/^\(\d{2}\) \d{4,5}-\d{4}$/).withMessage('Telefone deve estar no formato (00) 00000-0000'),
    
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
      .isDate().withMessage('Data de admissão deve ser uma data válida'),
    
    body('cnh_validade')
      .optional()
      .isDate().withMessage('Validade da CNH deve ser uma data válida'),
    
    body('observacoes')
      .optional()
      .isString().trim().isLength({ max: 500 }).withMessage('Observações devem ter no máximo 500 caracteres'),
    
    body('filial_id')
      .optional()
      .isInt({ min: 1 }).withMessage('ID da filial deve ser um número inteiro positivo'),
    
    handleValidationErrors
  ],

  // Validações para atualização de motorista
  update: [
    param('id').isInt({ min: 1 }).withMessage('ID deve ser um número inteiro positivo'),
    
    body('nome')
      .optional()
      .isString().trim().isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres'),
    
    body('cpf')
      .optional()
      .isString().trim().matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/).withMessage('CPF deve estar no formato 000.000.000-00'),
    
    body('cnh')
      .optional()
      .isString().trim().isLength({ min: 1, max: 20 }).withMessage('CNH deve ter entre 1 e 20 caracteres'),
    
    body('categoria_cnh')
      .optional()
      .isIn(['A', 'B', 'C', 'D', 'E', 'AB', 'AC', 'AD', 'AE', 'BC', 'BD', 'BE', 'CD', 'CE', 'DE']).withMessage('Categoria CNH deve ser uma das categorias válidas'),
    
    body('telefone')
      .optional()
      .isString().trim().matches(/^\(\d{2}\) \d{4,5}-\d{4}$/).withMessage('Telefone deve estar no formato (00) 00000-0000'),
    
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
      .isDate().withMessage('Data de admissão deve ser uma data válida'),
    
    body('cnh_validade')
      .optional()
      .isDate().withMessage('Validade da CNH deve ser uma data válida'),
    
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
  motoristaValidations,
  commonValidations,
  handleValidationErrors
};

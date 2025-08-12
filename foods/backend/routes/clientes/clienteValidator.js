/**
 * Validações específicas para Clientes
 * Centraliza todas as validações relacionadas aos clientes
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

// Validações específicas para clientes
const clienteValidations = {
  // Validações para criação de cliente
  create: [
    body('cnpj')
      .notEmpty().withMessage('CNPJ é obrigatório')
      .isString().trim()
      .matches(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/).withMessage('CNPJ deve estar no formato 00.000.000/0000-00'),
    
    body('razao_social')
      .notEmpty().withMessage('Razão social é obrigatória')
      .isString().trim().isLength({ min: 2, max: 200 }).withMessage('Razão social deve ter entre 2 e 200 caracteres'),
    
    body('nome_fantasia')
      .optional()
      .isString().trim().isLength({ max: 200 }).withMessage('Nome fantasia deve ter no máximo 200 caracteres'),
    
    body('logradouro')
      .notEmpty().withMessage('Logradouro é obrigatório')
      .isString().trim().isLength({ max: 300 }).withMessage('Logradouro deve ter no máximo 300 caracteres'),
    
    body('numero')
      .optional()
      .isString().trim().isLength({ max: 20 }).withMessage('Número deve ter no máximo 20 caracteres'),
    
    body('bairro')
      .optional()
      .isString().trim().isLength({ max: 100 }).withMessage('Bairro deve ter no máximo 100 caracteres'),
    
    body('cep')
      .optional()
      .isString().trim().matches(/^\d{5}-\d{3}$/).withMessage('CEP deve estar no formato 00000-000'),
    
    body('municipio')
      .notEmpty().withMessage('Município é obrigatório')
      .isString().trim().isLength({ min: 2, max: 100 }).withMessage('Município deve ter entre 2 e 100 caracteres'),
    
    body('uf')
      .notEmpty().withMessage('UF é obrigatória')
      .isString().trim().isLength({ min: 2, max: 2 }).withMessage('UF deve ter exatamente 2 caracteres'),
    
    body('pais')
      .optional()
      .isString().trim().isLength({ max: 50 }).withMessage('País deve ter no máximo 50 caracteres'),
    
    body('email')
      .optional()
      .isEmail().withMessage('Email deve ser um email válido'),
    
    body('telefone')
      .optional()
      .isString().trim().isLength({ max: 20 }).withMessage('Telefone deve ter no máximo 20 caracteres'),
    
    body('status')
      .optional()
      .isIn(['ativo', 'inativo', 'pendente']).withMessage('Status deve ser ativo, inativo ou pendente'),
    
    body('observacoes')
      .optional()
      .isString().trim().isLength({ max: 500 }).withMessage('Observações devem ter no máximo 500 caracteres'),
    
    handleValidationErrors
  ],

  // Validações para atualização de cliente
  update: [
    param('id').isInt({ min: 1 }).withMessage('ID deve ser um número inteiro positivo'),
    
    body('cnpj')
      .optional()
      .isString().trim()
      .matches(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/).withMessage('CNPJ deve estar no formato 00.000.000/0000-00'),
    
    body('razao_social')
      .optional()
      .isString().trim().isLength({ min: 2, max: 200 }).withMessage('Razão social deve ter entre 2 e 200 caracteres'),
    
    body('nome_fantasia')
      .optional()
      .isString().trim().isLength({ max: 200 }).withMessage('Nome fantasia deve ter no máximo 200 caracteres'),
    
    body('logradouro')
      .optional()
      .isString().trim().isLength({ max: 300 }).withMessage('Logradouro deve ter no máximo 300 caracteres'),
    
    body('numero')
      .optional()
      .isString().trim().isLength({ max: 20 }).withMessage('Número deve ter no máximo 20 caracteres'),
    
    body('bairro')
      .optional()
      .isString().trim().isLength({ max: 100 }).withMessage('Bairro deve ter no máximo 100 caracteres'),
    
    body('cep')
      .optional()
      .isString().trim().matches(/^\d{5}-\d{3}$/).withMessage('CEP deve estar no formato 00000-000'),
    
    body('municipio')
      .optional()
      .isString().trim().isLength({ min: 2, max: 100 }).withMessage('Município deve ter entre 2 e 100 caracteres'),
    
    body('uf')
      .optional()
      .isString().trim().isLength({ min: 2, max: 2 }).withMessage('UF deve ter exatamente 2 caracteres'),
    
    body('pais')
      .optional()
      .isString().trim().isLength({ max: 50 }).withMessage('País deve ter no máximo 50 caracteres'),
    
    body('email')
      .optional()
      .isEmail().withMessage('Email deve ser um email válido'),
    
    body('telefone')
      .optional()
      .isString().trim().isLength({ max: 20 }).withMessage('Telefone deve ter no máximo 20 caracteres'),
    
    body('status')
      .optional()
      .isIn(['ativo', 'inativo', 'pendente']).withMessage('Status deve ser ativo, inativo ou pendente'),
    
    body('observacoes')
      .optional()
      .isString().trim().isLength({ max: 500 }).withMessage('Observações devem ter no máximo 500 caracteres'),
    
    handleValidationErrors
  ]
};

module.exports = {
  clienteValidations,
  commonValidations,
  handleValidationErrors
};

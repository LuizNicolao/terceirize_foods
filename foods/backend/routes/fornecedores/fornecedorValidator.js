/**
 * Validações específicas para Fornecedores
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

// Validações específicas para fornecedores
const fornecedorValidations = {
  create: [
    body('cnpj')
      .notEmpty()
      .withMessage('CNPJ é obrigatório')
      .isLength({ min: 14, max: 18 })
      .withMessage('CNPJ deve ter entre 14 e 18 caracteres')
      .trim(),
    
    body('razao_social')
      .notEmpty()
      .withMessage('Razão social é obrigatória')
      .isLength({ min: 3, max: 150 })
      .withMessage('Razão social deve ter entre 3 e 150 caracteres')
      .trim(),
    
    body('nome_fantasia')
      .optional()
      .isLength({ min: 3, max: 150 })
      .withMessage('Nome fantasia deve ter entre 3 e 150 caracteres')
      .trim(),
    
    body('logradouro')
      .optional()
      .isLength({ min: 3, max: 150 })
      .withMessage('Logradouro deve ter entre 3 e 150 caracteres')
      .trim(),
    
    body('numero')
      .optional()
      .isLength({ min: 1, max: 10 })
      .withMessage('Número deve ter entre 1 e 10 caracteres')
      .trim(),
    
    body('cep')
      .optional()
      .isLength({ min: 8, max: 15 })
      .withMessage('CEP deve ter entre 8 e 15 caracteres')
      .trim(),
    
    body('bairro')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Bairro deve ter entre 2 e 100 caracteres')
      .trim(),
    
    body('municipio')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Município deve ter entre 2 e 100 caracteres')
      .trim(),
    
    body('uf')
      .optional()
      .isLength({ min: 2, max: 5 })
      .withMessage('UF deve ter entre 2 e 5 caracteres')
      .trim(),
    
    body('email')
      .optional()
      .isEmail()
      .withMessage('Email deve ser um email válido')
      .normalizeEmail(),
    
    body('telefone')
      .optional()
      .isLength({ min: 8, max: 20 })
      .withMessage('Telefone deve ter entre 8 e 20 caracteres')
      .trim(),
    
    body('status')
      .optional()
      .isIn([0, 1, '0', '1'])
      .withMessage('Status deve ser 0 (inativo) ou 1 (ativo)'),
    
    handleValidationErrors
  ],

  update: [
    commonValidations.id,
    
    body('cnpj')
      .optional()
      .isLength({ min: 14, max: 18 })
      .withMessage('CNPJ deve ter entre 14 e 18 caracteres')
      .trim(),
    
    body('razao_social')
      .optional()
      .isLength({ min: 3, max: 150 })
      .withMessage('Razão social deve ter entre 3 e 150 caracteres')
      .trim(),
    
    body('nome_fantasia')
      .optional()
      .isLength({ min: 3, max: 150 })
      .withMessage('Nome fantasia deve ter entre 3 e 150 caracteres')
      .trim(),
    
    body('logradouro')
      .optional()
      .isLength({ min: 3, max: 150 })
      .withMessage('Logradouro deve ter entre 3 e 150 caracteres')
      .trim(),
    
    body('numero')
      .optional()
      .isLength({ min: 1, max: 10 })
      .withMessage('Número deve ter entre 1 e 10 caracteres')
      .trim(),
    
    body('cep')
      .optional()
      .isLength({ min: 8, max: 15 })
      .withMessage('CEP deve ter entre 8 e 15 caracteres')
      .trim(),
    
    body('bairro')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Bairro deve ter entre 2 e 100 caracteres')
      .trim(),
    
    body('municipio')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Município deve ter entre 2 e 100 caracteres')
      .trim(),
    
    body('uf')
      .optional()
      .isLength({ min: 2, max: 5 })
      .withMessage('UF deve ter entre 2 e 5 caracteres')
      .trim(),
    
    body('email')
      .optional()
      .isEmail()
      .withMessage('Email deve ser um email válido')
      .normalizeEmail(),
    
    body('telefone')
      .optional()
      .isLength({ min: 8, max: 20 })
      .withMessage('Telefone deve ter entre 8 e 20 caracteres')
      .trim(),
    
    body('status')
      .optional()
      .isIn([0, 1, '0', '1'])
      .withMessage('Status deve ser 0 (inativo) ou 1 (ativo)'),
    
    handleValidationErrors
  ]
};

module.exports = {
  fornecedorValidations,
  commonValidations,
  handleValidationErrors
};

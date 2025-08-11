/**
 * Validações específicas para Unidades Escolares
 * Centraliza todas as validações relacionadas às unidades escolares
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
  id: [
    param('id').isInt({ min: 1 }).withMessage('ID deve ser um número inteiro positivo')
  ],
  
  // Validação de paginação
  pagination: [
    query('page').optional().isInt({ min: 1 }).withMessage('Página deve ser um número inteiro positivo'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limite deve ser entre 1 e 100')
  ],
  
  // Validação de busca
  search: [
    query('search').optional().isString().trim().isLength({ min: 1, max: 100 }).withMessage('Termo de busca deve ter entre 1 e 100 caracteres')
  ]
};

// Validações específicas para unidades escolares
const unidadeEscolarValidations = {
  // Validações para criação de unidade escolar
  create: [
    body('codigo_teknisa')
      .notEmpty().withMessage('Código Teknisa é obrigatório')
      .isString().trim().isLength({ min: 1, max: 50 }).withMessage('Código deve ter entre 1 e 50 caracteres'),
    
    body('nome_escola')
      .notEmpty().withMessage('Nome da escola é obrigatório')
      .isString().trim().isLength({ min: 2, max: 200 }).withMessage('Nome deve ter entre 2 e 200 caracteres'),
    
    body('cidade')
      .notEmpty().withMessage('Cidade é obrigatória')
      .isString().trim().isLength({ min: 2, max: 100 }).withMessage('Cidade deve ter entre 2 e 100 caracteres'),
    
    body('estado')
      .notEmpty().withMessage('Estado é obrigatório')
      .isString().trim().isLength({ min: 2, max: 2 }).withMessage('Estado deve ter 2 caracteres'),
    
    body('cep')
      .optional()
      .isString().trim().matches(/^\d{5}-?\d{3}$/).withMessage('CEP deve estar no formato 00000-000'),
    
    body('endereco')
      .optional()
      .isString().trim().isLength({ max: 300 }).withMessage('Endereço deve ter no máximo 300 caracteres'),
    
    body('rota_id')
      .optional()
      .isInt({ min: 1 }).withMessage('ID da rota deve ser um número inteiro positivo'),
    
    body('centro_distribuicao')
      .optional()
      .isString().trim().isLength({ max: 100 }).withMessage('Centro de distribuição deve ter no máximo 100 caracteres'),
    
    body('status')
      .optional()
      .isIn(['ativo', 'inativo']).withMessage('Status deve ser ativo ou inativo'),
    
    body('telefone')
      .optional()
      .isString().trim().matches(/^\(\d{2}\) \d{4,5}-\d{4}$/).withMessage('Telefone deve estar no formato (00) 00000-0000'),
    
    body('email')
      .optional()
      .isEmail().withMessage('Email deve ser válido'),
    
    body('diretor')
      .optional()
      .isString().trim().isLength({ max: 100 }).withMessage('Diretor deve ter no máximo 100 caracteres'),
    
    body('observacoes')
      .optional()
      .isString().trim().isLength({ max: 500 }).withMessage('Observações devem ter no máximo 500 caracteres'),
    
    handleValidationErrors
  ],

  // Validações para atualização de unidade escolar
  update: [
    param('id').isInt({ min: 1 }).withMessage('ID deve ser um número inteiro positivo'),
    
    body('codigo_teknisa')
      .optional()
      .isString().trim().isLength({ min: 1, max: 50 }).withMessage('Código deve ter entre 1 e 50 caracteres'),
    
    body('nome_escola')
      .optional()
      .isString().trim().isLength({ min: 2, max: 200 }).withMessage('Nome deve ter entre 2 e 200 caracteres'),
    
    body('cidade')
      .optional()
      .isString().trim().isLength({ min: 2, max: 100 }).withMessage('Cidade deve ter entre 2 e 100 caracteres'),
    
    body('estado')
      .optional()
      .isString().trim().isLength({ min: 2, max: 2 }).withMessage('Estado deve ter 2 caracteres'),
    
    body('cep')
      .optional()
      .isString().trim().matches(/^\d{5}-?\d{3}$/).withMessage('CEP deve estar no formato 00000-000'),
    
    body('endereco')
      .optional()
      .isString().trim().isLength({ max: 300 }).withMessage('Endereço deve ter no máximo 300 caracteres'),
    
    body('rota_id')
      .optional()
      .isInt({ min: 1 }).withMessage('ID da rota deve ser um número inteiro positivo'),
    
    body('centro_distribuicao')
      .optional()
      .isString().trim().isLength({ max: 100 }).withMessage('Centro de distribuição deve ter no máximo 100 caracteres'),
    
    body('status')
      .optional()
      .isIn(['ativo', 'inativo']).withMessage('Status deve ser ativo ou inativo'),
    
    body('telefone')
      .optional()
      .isString().trim().matches(/^\(\d{2}\) \d{4,5}-\d{4}$/).withMessage('Telefone deve estar no formato (00) 00000-0000'),
    
    body('email')
      .optional()
      .isEmail().withMessage('Email deve ser válido'),
    
    body('diretor')
      .optional()
      .isString().trim().isLength({ max: 100 }).withMessage('Diretor deve ter no máximo 100 caracteres'),
    
    body('observacoes')
      .optional()
      .isString().trim().isLength({ max: 500 }).withMessage('Observações devem ter no máximo 500 caracteres'),
    
    handleValidationErrors
  ]
};

module.exports = {
  unidadeEscolarValidations,
  commonValidations,
  handleValidationErrors
};

const { body, param, query } = require('express-validator');
const { createEntityValidationHandler } = require('../../middleware/validationHandler');

// Criar handler de validação específico para filiais
const handleValidationErrors = createEntityValidationHandler('filiais');

// Validações para criação de filial
const filialValidations = [
  body('filial')
    .notEmpty()
    .withMessage('Nome da filial é obrigatório')
    .isLength({ min: 2, max: 255 })
    .withMessage('Nome da filial deve ter entre 2 e 255 caracteres'),
  
  body('razao_social')
    .notEmpty()
    .withMessage('Razão social é obrigatória')
    .isLength({ min: 2, max: 255 })
    .withMessage('Razão social deve ter entre 2 e 255 caracteres'),
  
  body('cnpj')
    .optional()
    .isLength({ min: 14, max: 18 })
    .withMessage('CNPJ deve ter entre 14 e 18 caracteres'),
  
  body('codigo_filial')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Código da filial deve ter no máximo 50 caracteres'),
  
  body('logradouro')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Logradouro deve ter no máximo 255 caracteres'),
  
  body('numero')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Número deve ter no máximo 20 caracteres'),
  
  body('bairro')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Bairro deve ter no máximo 100 caracteres'),
  
  body('cidade')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Cidade deve ter no máximo 100 caracteres'),
  
  body('estado')
    .optional()
    .isLength({ min: 2, max: 2 })
    .withMessage('Estado deve ter exatamente 2 caracteres'),
  
  body('cep')
    .optional()
    .matches(/^\d{5}-?\d{3}$/)
    .withMessage('CEP deve estar no formato 00000-000'),
  
  body('supervisao')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Supervisão deve ter no máximo 100 caracteres'),
  
  body('coordenacao')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Coordenação deve ter no máximo 100 caracteres'),
  
  body('status')
    .notEmpty()
    .withMessage('Status é obrigatório')
    .isIn(['0', '1'])
    .withMessage('Status deve ser 0 (inativo) ou 1 (ativo)'),
  
  handleValidationErrors
];

// Validações para atualização de filial
const filialAtualizacaoValidations = [
  body('filial')
    .optional()
    .isLength({ min: 2, max: 255 })
    .withMessage('Nome da filial deve ter entre 2 e 255 caracteres'),
  
  body('razao_social')
    .optional()
    .isLength({ min: 2, max: 255 })
    .withMessage('Razão social deve ter entre 2 e 255 caracteres'),
  
  body('cnpj')
    .optional()
    .isLength({ min: 14, max: 18 })
    .withMessage('CNPJ deve ter entre 14 e 18 caracteres'),
  
  body('codigo_filial')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Código da filial deve ter no máximo 50 caracteres'),
  
  body('logradouro')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Logradouro deve ter no máximo 255 caracteres'),
  
  body('numero')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Número deve ter no máximo 20 caracteres'),
  
  body('bairro')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Bairro deve ter no máximo 100 caracteres'),
  
  body('cidade')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Cidade deve ter no máximo 100 caracteres'),
  
  body('estado')
    .optional()
    .isLength({ min: 2, max: 2 })
    .withMessage('Estado deve ter exatamente 2 caracteres'),
  
  body('cep')
    .optional()
    .matches(/^\d{5}-?\d{3}$/)
    .withMessage('CEP deve estar no formato 00000-000'),
  
  body('supervisao')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Supervisão deve ter no máximo 100 caracteres'),
  
  body('coordenacao')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Coordenação deve ter no máximo 100 caracteres'),
  
  body('status')
    .optional()
    .isIn(['0', '1'])
    .withMessage('Status deve ser 0 (inativo) ou 1 (ativo)'),
  
  handleValidationErrors
];

// Validações comuns
const commonValidations = {
  id: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID deve ser um número inteiro positivo')
  ],
  
  search: [
    query('search')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('Termo de busca deve ter entre 1 e 100 caracteres')
  ],
  
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

module.exports = {
  filialValidations,
  filialAtualizacaoValidations,
  commonValidations,
  handleValidationErrors
};

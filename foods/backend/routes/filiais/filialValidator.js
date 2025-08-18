const { body, param, query } = require('express-validator');
const { createEntityValidationHandler } = require('../../middleware/validationHandler');

// Criar handler de validação específico para filiais
const handleValidationErrors = createEntityValidationHandler('filiais');

// Validações comuns
const commonValidations = {
  // Validação de ID
  id: param('id')
    .isInt({ min: 1 })
    .withMessage('ID deve ser um número inteiro positivo'),
  
  // Validação de busca
  search: query('search')
    .optional()
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

// Validações específicas para filiais
const filialValidations = {
  // Validações para criação de filial
  create: [
    body('filial')
      .notEmpty().withMessage('Nome da filial é obrigatório')
      .custom((value) => {
        if (typeof value === 'string') {
          const trimmed = value.trim();
          return trimmed.length >= 2 && trimmed.length <= 255;
        }
        return false;
      })
      .withMessage('Nome da filial deve ter entre 2 e 255 caracteres'),
    
    body('razao_social')
      .notEmpty().withMessage('Razão social é obrigatória')
      .custom((value) => {
        if (typeof value === 'string') {
          const trimmed = value.trim();
          return trimmed.length >= 2 && trimmed.length <= 255;
        }
        return false;
      })
      .withMessage('Razão social deve ter entre 2 e 255 caracteres'),
    
    body('cnpj')
      .optional()
      .custom((value) => {
        if (value === null || value === undefined || value === '') {
          return true; // Aceita valores vazios
        }
        if (typeof value === 'string') {
          const cleanValue = value.replace(/\D/g, '');
          return cleanValue.length >= 14 && cleanValue.length <= 18;
        }
        return false;
      })
      .withMessage('CNPJ deve ter entre 14 e 18 caracteres'),
    
    body('codigo_filial')
      .optional()
      .custom((value) => {
        if (value === null || value === undefined || value === '') {
          return true; // Aceita valores vazios
        }
        if (typeof value === 'string') {
          const trimmed = value.trim();
          return trimmed.length <= 50;
        }
        return false;
      })
      .withMessage('Código da filial deve ter no máximo 50 caracteres'),
    
    body('logradouro')
      .optional()
      .custom((value) => {
        if (value === null || value === undefined || value === '') {
          return true; // Aceita valores vazios
        }
        if (typeof value === 'string') {
          const trimmed = value.trim();
          return trimmed.length <= 255;
        }
        return false;
      })
      .withMessage('Logradouro deve ter no máximo 255 caracteres'),
    
    body('numero')
      .optional()
      .custom((value) => {
        if (value === null || value === undefined || value === '') {
          return true; // Aceita valores vazios
        }
        if (typeof value === 'string') {
          const trimmed = value.trim();
          return trimmed.length <= 20;
        }
        return false;
      })
      .withMessage('Número deve ter no máximo 20 caracteres'),
    
    body('bairro')
      .optional()
      .custom((value) => {
        if (value === null || value === undefined || value === '') {
          return true; // Aceita valores vazios
        }
        if (typeof value === 'string') {
          const trimmed = value.trim();
          return trimmed.length <= 100;
        }
        return false;
      })
      .withMessage('Bairro deve ter no máximo 100 caracteres'),
    
    body('cidade')
      .optional()
      .custom((value) => {
        if (value === null || value === undefined || value === '') {
          return true; // Aceita valores vazios
        }
        if (typeof value === 'string') {
          const trimmed = value.trim();
          return trimmed.length <= 100;
        }
        return false;
      })
      .withMessage('Cidade deve ter no máximo 100 caracteres'),
    
    body('estado')
      .optional()
      .custom((value) => {
        if (value === null || value === undefined || value === '') {
          return true; // Aceita valores vazios
        }
        if (typeof value === 'string') {
          const trimmed = value.trim();
          return trimmed.length >= 2 && trimmed.length <= 2;
        }
        return false;
      })
      .withMessage('Estado deve ter exatamente 2 caracteres'),
    
    body('cep')
      .optional()
      .custom((value) => {
        if (value === null || value === undefined || value === '') {
          return true; // Aceita valores vazios
        }
        if (typeof value === 'string') {
          const cleanValue = value.replace(/\D/g, '');
          return cleanValue.length >= 8 && cleanValue.length <= 15;
        }
        return false;
      })
      .withMessage('CEP deve ter entre 8 e 15 caracteres'),
    
    body('supervisao')
      .optional()
      .custom((value) => {
        if (value === null || value === undefined || value === '') {
          return true; // Aceita valores vazios
        }
        if (typeof value === 'string') {
          const trimmed = value.trim();
          return trimmed.length <= 100;
        }
        return false;
      })
      .withMessage('Supervisão deve ter no máximo 100 caracteres'),
    
    body('coordenacao')
      .optional()
      .custom((value) => {
        if (value === null || value === undefined || value === '') {
          return true; // Aceita valores vazios
        }
        if (typeof value === 'string') {
          const trimmed = value.trim();
          return trimmed.length <= 100;
        }
        return false;
      })
      .withMessage('Coordenação deve ter no máximo 100 caracteres'),
    
    body('status')
      .notEmpty().withMessage('Status é obrigatório')
      .custom((value) => {
        return ['0', '1'].includes(value);
      })
      .withMessage('Status deve ser 0 (inativo) ou 1 (ativo)'),
    
    handleValidationErrors
  ],

  // Validações para atualização de filial
  update: [
    param('id').isInt({ min: 1 }).withMessage('ID deve ser um número inteiro positivo'),
    
    body('filial')
      .optional()
      .custom((value) => {
        if (value === null || value === undefined || value === '') {
          return true; // Aceita valores vazios
        }
        if (typeof value === 'string') {
          const trimmed = value.trim();
          return trimmed.length >= 2 && trimmed.length <= 255;
        }
        return false;
      })
      .withMessage('Nome da filial deve ter entre 2 e 255 caracteres'),
    
    body('razao_social')
      .optional()
      .custom((value) => {
        if (value === null || value === undefined || value === '') {
          return true; // Aceita valores vazios
        }
        if (typeof value === 'string') {
          const trimmed = value.trim();
          return trimmed.length >= 2 && trimmed.length <= 255;
        }
        return false;
      })
      .withMessage('Razão social deve ter entre 2 e 255 caracteres'),
    
    body('cnpj')
      .optional()
      .custom((value) => {
        if (value === null || value === undefined || value === '') {
          return true; // Aceita valores vazios
        }
        if (typeof value === 'string') {
          const cleanValue = value.replace(/\D/g, '');
          return cleanValue.length >= 14 && cleanValue.length <= 18;
        }
        return false;
      })
      .withMessage('CNPJ deve ter entre 14 e 18 caracteres'),
    
    body('codigo_filial')
      .optional()
      .custom((value) => {
        if (value === null || value === undefined || value === '') {
          return true; // Aceita valores vazios
        }
        if (typeof value === 'string') {
          const trimmed = value.trim();
          return trimmed.length <= 50;
        }
        return false;
      })
      .withMessage('Código da filial deve ter no máximo 50 caracteres'),
    
    body('logradouro')
      .optional()
      .custom((value) => {
        if (value === null || value === undefined || value === '') {
          return true; // Aceita valores vazios
        }
        if (typeof value === 'string') {
          const trimmed = value.trim();
          return trimmed.length <= 255;
        }
        return false;
      })
      .withMessage('Logradouro deve ter no máximo 255 caracteres'),
    
    body('numero')
      .optional()
      .custom((value) => {
        if (value === null || value === undefined || value === '') {
          return true; // Aceita valores vazios
        }
        if (typeof value === 'string') {
          const trimmed = value.trim();
          return trimmed.length <= 20;
        }
        return false;
      })
      .withMessage('Número deve ter no máximo 20 caracteres'),
    
    body('bairro')
      .optional()
      .custom((value) => {
        if (value === null || value === undefined || value === '') {
          return true; // Aceita valores vazios
        }
        if (typeof value === 'string') {
          const trimmed = value.trim();
          return trimmed.length <= 100;
        }
        return false;
      })
      .withMessage('Bairro deve ter no máximo 100 caracteres'),
    
    body('cidade')
      .optional()
      .custom((value) => {
        if (value === null || value === undefined || value === '') {
          return true; // Aceita valores vazios
        }
        if (typeof value === 'string') {
          const trimmed = value.trim();
          return trimmed.length <= 100;
        }
        return false;
      })
      .withMessage('Cidade deve ter no máximo 100 caracteres'),
    
    body('estado')
      .optional()
      .custom((value) => {
        if (value === null || value === undefined || value === '') {
          return true; // Aceita valores vazios
        }
        if (typeof value === 'string') {
          const trimmed = value.trim();
          return trimmed.length >= 2 && trimmed.length <= 2;
        }
        return false;
      })
      .withMessage('Estado deve ter exatamente 2 caracteres'),
    
    body('cep')
      .optional()
      .custom((value) => {
        if (value === null || value === undefined || value === '') {
          return true; // Aceita valores vazios
        }
        if (typeof value === 'string') {
          const cleanValue = value.replace(/\D/g, '');
          return cleanValue.length >= 8 && cleanValue.length <= 15;
        }
        return false;
      })
      .withMessage('CEP deve ter entre 8 e 15 caracteres'),
    
    body('supervisao')
      .optional()
      .custom((value) => {
        if (value === null || value === undefined || value === '') {
          return true; // Aceita valores vazios
        }
        if (typeof value === 'string') {
          const trimmed = value.trim();
          return trimmed.length <= 100;
        }
        return false;
      })
      .withMessage('Supervisão deve ter no máximo 100 caracteres'),
    
    body('coordenacao')
      .optional()
      .custom((value) => {
        if (value === null || value === undefined || value === '') {
          return true; // Aceita valores vazios
        }
        if (typeof value === 'string') {
          const trimmed = value.trim();
          return trimmed.length <= 100;
        }
        return false;
      })
      .withMessage('Coordenação deve ter no máximo 100 caracteres'),
    
    body('status')
      .optional()
      .custom((value) => {
        if (value === null || value === undefined || value === '') {
          return true; // Aceita valores vazios
        }
        return ['0', '1'].includes(value);
      })
      .withMessage('Status deve ser 0 (inativo) ou 1 (ativo)'),
    
    handleValidationErrors
  ]
};

module.exports = {
  filialValidations,
  commonValidations
};

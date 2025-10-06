/**
 * Validações específicas para Clientes
 * Centraliza todas as validações relacionadas aos clientes
 */

const { body, param, query } = require('express-validator');
const { createEntityValidationHandler } = require('../../middleware/validationHandler');

// Criar handler de validação específico para clientes
const handleValidationErrors = createEntityValidationHandler('clientes');

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
    
    body('razao_social')
      .notEmpty().withMessage('Razão social é obrigatória')
      .custom((value) => {
        if (typeof value === 'string') {
          const trimmed = value.trim();
          return trimmed.length >= 2 && trimmed.length <= 200;
        }
        return false;
      })
      .withMessage('Razão social deve ter entre 2 e 200 caracteres'),
    
    body('nome_fantasia')
      .optional()
      .custom((value) => {
        if (value === null || value === undefined || value === '') {
          return true; // Aceita valores vazios
        }
        if (typeof value === 'string') {
          const trimmed = value.trim();
          return trimmed.length <= 200;
        }
        return false;
      })
      .withMessage('Nome fantasia deve ter no máximo 200 caracteres'),
    
    body('logradouro')
      .notEmpty().withMessage('Logradouro é obrigatório')
      .custom((value) => {
        if (typeof value === 'string') {
          const trimmed = value.trim();
          return trimmed.length <= 300;
        }
        return false;
      })
      .withMessage('Logradouro deve ter no máximo 300 caracteres'),
    
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
    
    body('municipio')
      .notEmpty().withMessage('Município é obrigatório')
      .custom((value) => {
        if (typeof value === 'string') {
          const trimmed = value.trim();
          return trimmed.length >= 2 && trimmed.length <= 100;
        }
        return false;
      })
      .withMessage('Município deve ter entre 2 e 100 caracteres'),
    
    body('uf')
      .notEmpty().withMessage('UF é obrigatória')
      .custom((value) => {
        if (typeof value === 'string') {
          const trimmed = value.trim();
          return trimmed.length >= 2 && trimmed.length <= 2;
        }
        return false;
      })
      .withMessage('UF deve ter exatamente 2 caracteres'),
    
    body('pais')
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
      .withMessage('País deve ter no máximo 50 caracteres'),
    
    body('email')
      .optional()
      .custom((value) => {
        if (value === null || value === undefined || value === '') {
          return true; // Aceita valores vazios
        }
        if (typeof value === 'string') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(value);
        }
        return false;
      })
      .withMessage('Email deve ser válido'),
    
    body('telefone')
      .optional()
      .custom((value) => {
        if (value === null || value === undefined || value === '') {
          return true; // Aceita valores vazios
        }
        if (typeof value === 'string') {
          const cleanValue = value.replace(/\D/g, '');
          return cleanValue.length <= 20;
        }
        return false;
      })
      .withMessage('Telefone deve ter no máximo 20 caracteres'),
    
    body('status')
      .optional()
      .custom((value) => {
        if (value === null || value === undefined || value === '') {
          return true; // Aceita valores vazios
        }
        return ['ativo', 'inativo', 'pendente'].includes(value);
      })
      .withMessage('Status deve ser ativo, inativo ou pendente'),
    
    body('observacoes')
      .optional()
      .custom((value) => {
        if (value === null || value === undefined || value === '') {
          return true; // Aceita valores vazios
        }
        if (typeof value === 'string') {
          const trimmed = value.trim();
          return trimmed.length <= 500;
        }
        return false;
      })
      .withMessage('Observações devem ter no máximo 500 caracteres'),
    
    handleValidationErrors
  ],

  // Validações para atualização de cliente
  update: [
    param('id').isInt({ min: 1 }).withMessage('ID deve ser um número inteiro positivo'),
    
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
    
    body('razao_social')
      .optional()
      .custom((value) => {
        if (value === null || value === undefined || value === '') {
          return true; // Aceita valores vazios
        }
        if (typeof value === 'string') {
          const trimmed = value.trim();
          return trimmed.length >= 2 && trimmed.length <= 200;
        }
        return false;
      })
      .withMessage('Razão social deve ter entre 2 e 200 caracteres'),
    
    body('nome_fantasia')
      .optional()
      .custom((value) => {
        if (value === null || value === undefined || value === '') {
          return true; // Aceita valores vazios
        }
        if (typeof value === 'string') {
          const trimmed = value.trim();
          return trimmed.length <= 200;
        }
        return false;
      })
      .withMessage('Nome fantasia deve ter no máximo 200 caracteres'),
    
    body('logradouro')
      .optional()
      .custom((value) => {
        if (value === null || value === undefined || value === '') {
          return true; // Aceita valores vazios
        }
        if (typeof value === 'string') {
          const trimmed = value.trim();
          return trimmed.length <= 300;
        }
        return false;
      })
      .withMessage('Logradouro deve ter no máximo 300 caracteres'),
    
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
    
    body('municipio')
      .optional()
      .custom((value) => {
        if (value === null || value === undefined || value === '') {
          return true; // Aceita valores vazios
        }
        if (typeof value === 'string') {
          const trimmed = value.trim();
          return trimmed.length >= 2 && trimmed.length <= 100;
        }
        return false;
      })
      .withMessage('Município deve ter entre 2 e 100 caracteres'),
    
    body('uf')
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
      .withMessage('UF deve ter exatamente 2 caracteres'),
    
    body('pais')
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
      .withMessage('País deve ter no máximo 50 caracteres'),
    
    body('email')
      .optional()
      .custom((value) => {
        if (value === null || value === undefined || value === '') {
          return true; // Aceita valores vazios
        }
        if (typeof value === 'string') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(value);
        }
        return false;
      })
      .withMessage('Email deve ser válido'),
    
    body('telefone')
      .optional()
      .custom((value) => {
        if (value === null || value === undefined || value === '') {
          return true; // Aceita valores vazios
        }
        if (typeof value === 'string') {
          const cleanValue = value.replace(/\D/g, '');
          return cleanValue.length <= 20;
        }
        return false;
      })
      .withMessage('Telefone deve ter no máximo 20 caracteres'),
    
    body('status')
      .optional()
      .custom((value) => {
        if (value === null || value === undefined || value === '') {
          return true; // Aceita valores vazios
        }
        return ['ativo', 'inativo', 'pendente'].includes(value);
      })
      .withMessage('Status deve ser ativo, inativo ou pendente'),
    
    body('observacoes')
      .optional()
      .custom((value) => {
        if (value === null || value === undefined || value === '') {
          return true; // Aceita valores vazios
        }
        if (typeof value === 'string') {
          const trimmed = value.trim();
          return trimmed.length <= 500;
        }
        return false;
      })
      .withMessage('Observações devem ter no máximo 500 caracteres'),
    
    handleValidationErrors
  ]
};

module.exports = {
  clienteValidations,
  commonValidations
};

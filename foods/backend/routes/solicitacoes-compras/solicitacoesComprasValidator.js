/**
 * Validações específicas para Solicitações de Compras
 * Implementa validações usando express-validator
 */

const { body, param, query } = require('express-validator');
const { createEntityValidationHandler } = require('../../middleware/validationHandler');

// Criar handler de validação específico para solicitações de compras
const handleValidationErrors = createEntityValidationHandler('solicitacoes-compras');

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

// Validações específicas para Solicitações de Compras
const solicitacoesComprasValidations = {
  create: [
    body('filial_id')
      .notEmpty()
      .withMessage('Filial é obrigatória')
      .custom((value) => {
        if (value === null || value === undefined || value === '' || value === 0) {
          throw new Error('Filial é obrigatória');
        }
        const num = typeof value === 'string' ? parseInt(value, 10) : Number(value);
        if (isNaN(num) || num < 1) {
          throw new Error('Filial deve ser um ID válido');
        }
        return true;
      })
      .customSanitizer((value) => {
        return typeof value === 'string' ? parseInt(value, 10) : Number(value);
      }),
    body('data_entrega_cd')
      .isISO8601()
      .withMessage('Data de entrega CD deve ser uma data válida (formato ISO)'),
    body('motivo')
      .isIn(['Compra Emergencial', 'Compra Programada'])
      .withMessage('Motivo deve ser "Compra Emergencial" ou "Compra Programada"'),
    body('observacoes')
      .optional({ nullable: true, checkFalsy: true })
      .custom((value, { req }) => {
        // Se motivo for "Compra Emergencial", observações são obrigatórias
        if (req.body.motivo && req.body.motivo === 'Compra Emergencial') {
          if (value === null || value === undefined || value === '' || (typeof value === 'string' && value.trim() === '')) {
            throw new Error('Observações são obrigatórias para Compra Emergencial');
          }
        }
        // Se o valor existir e não for vazio, validar formato
        if (value !== null && value !== undefined && value !== '') {
          if (typeof value !== 'string') {
            throw new Error('Observações devem ser um texto válido');
          }
          const trimmed = value.trim();
          if (trimmed.length > 1000) {
            throw new Error('Observações devem ter no máximo 1000 caracteres');
          }
        }
        return true;
      }),
    body('itens')
      .isArray({ min: 1 })
      .withMessage('A solicitação deve ter pelo menos um item'),
    body('itens.*.produto_id')
      .notEmpty()
      .withMessage('Produto é obrigatório para cada item')
      .custom((value) => {
        if (value === null || value === undefined || value === '' || value === 0) {
          throw new Error('Produto é obrigatório para cada item');
        }
        const num = typeof value === 'string' ? parseInt(value, 10) : Number(value);
        if (isNaN(num) || num < 1) {
          throw new Error('Produto deve ter um ID válido');
        }
        return true;
      })
      .customSanitizer((value) => {
        return typeof value === 'string' ? parseInt(value, 10) : Number(value);
      }),
    body('itens.*.quantidade')
      .notEmpty()
      .withMessage('Quantidade é obrigatória para cada item')
      .custom((value) => {
        if (value === null || value === undefined || value === '' || value === 0) {
          throw new Error('Quantidade é obrigatória para cada item');
        }
        const num = typeof value === 'string' ? parseFloat(value) : Number(value);
        if (isNaN(num) || num <= 0) {
          throw new Error('Quantidade deve ser maior que zero');
        }
        return true;
      })
      .customSanitizer((value) => {
        return typeof value === 'string' ? parseFloat(value) : Number(value);
      }),
    body('itens.*.unidade_medida_id')
      .notEmpty()
      .withMessage('Unidade é obrigatória para cada item')
      .custom((value) => {
        if (value === null || value === undefined || value === '' || value === 0) {
          throw new Error('Unidade é obrigatória para cada item');
        }
        const num = typeof value === 'string' ? parseInt(value, 10) : Number(value);
        if (isNaN(num) || num < 1) {
          throw new Error('Unidade deve ter um ID válido');
        }
        return true;
      })
      .customSanitizer((value) => {
        return typeof value === 'string' ? parseInt(value, 10) : Number(value);
      }),
    body('itens.*.observacao')
      .optional({ nullable: true, checkFalsy: true })
      .custom((value) => {
        // Se o valor existir, deve ser uma string válida
        if (value !== null && value !== undefined && value !== '') {
          if (typeof value !== 'string') {
            throw new Error('Observação do item deve ser um texto');
          }
          const trimmed = value.trim();
          if (trimmed.length > 500) {
            throw new Error('Observação do item deve ter no máximo 500 caracteres');
          }
        }
        return true;
      }),
    handleValidationErrors
  ],

  update: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID deve ser um número inteiro positivo'),
    body('filial_id')
      .notEmpty()
      .withMessage('Filial é obrigatória')
      .custom((value) => {
        if (value === null || value === undefined || value === '' || value === 0) {
          throw new Error('Filial é obrigatória');
        }
        const num = typeof value === 'string' ? parseInt(value, 10) : Number(value);
        if (isNaN(num) || num < 1) {
          throw new Error('Filial deve ser um ID válido');
        }
        return true;
      })
      .customSanitizer((value) => {
        return typeof value === 'string' ? parseInt(value, 10) : Number(value);
      }),
    body('data_entrega_cd')
      .isISO8601()
      .withMessage('Data de entrega CD deve ser uma data válida (formato ISO)'),
    body('motivo')
      .isIn(['Compra Emergencial', 'Compra Programada'])
      .withMessage('Motivo deve ser "Compra Emergencial" ou "Compra Programada"'),
    body('observacoes')
      .optional({ nullable: true, checkFalsy: true })
      .custom((value, { req }) => {
        // Se motivo for "Compra Emergencial", observações são obrigatórias
        if (req.body.motivo && req.body.motivo === 'Compra Emergencial') {
          if (value === null || value === undefined || value === '' || (typeof value === 'string' && value.trim() === '')) {
            throw new Error('Observações são obrigatórias para Compra Emergencial');
          }
        }
        // Se o valor existir e não for vazio, validar formato
        if (value !== null && value !== undefined && value !== '') {
          if (typeof value !== 'string') {
            throw new Error('Observações devem ser um texto válido');
          }
          const trimmed = value.trim();
          if (trimmed.length > 1000) {
            throw new Error('Observações devem ter no máximo 1000 caracteres');
          }
        }
        return true;
      }),
    body('itens')
      .isArray({ min: 1 })
      .withMessage('A solicitação deve ter pelo menos um item'),
    body('itens.*.produto_id')
      .notEmpty()
      .withMessage('Produto é obrigatório para cada item')
      .custom((value) => {
        if (value === null || value === undefined || value === '' || value === 0) {
          throw new Error('Produto é obrigatório para cada item');
        }
        const num = typeof value === 'string' ? parseInt(value, 10) : Number(value);
        if (isNaN(num) || num < 1) {
          throw new Error('Produto deve ter um ID válido');
        }
        return true;
      })
      .customSanitizer((value) => {
        return typeof value === 'string' ? parseInt(value, 10) : Number(value);
      }),
    body('itens.*.quantidade')
      .notEmpty()
      .withMessage('Quantidade é obrigatória para cada item')
      .custom((value) => {
        if (value === null || value === undefined || value === '' || value === 0) {
          throw new Error('Quantidade é obrigatória para cada item');
        }
        const num = typeof value === 'string' ? parseFloat(value) : Number(value);
        if (isNaN(num) || num <= 0) {
          throw new Error('Quantidade deve ser maior que zero');
        }
        return true;
      })
      .customSanitizer((value) => {
        return typeof value === 'string' ? parseFloat(value) : Number(value);
      }),
    body('itens.*.unidade_medida_id')
      .notEmpty()
      .withMessage('Unidade é obrigatória para cada item')
      .custom((value) => {
        if (value === null || value === undefined || value === '' || value === 0) {
          throw new Error('Unidade é obrigatória para cada item');
        }
        const num = typeof value === 'string' ? parseInt(value, 10) : Number(value);
        if (isNaN(num) || num < 1) {
          throw new Error('Unidade deve ter um ID válido');
        }
        return true;
      })
      .customSanitizer((value) => {
        return typeof value === 'string' ? parseInt(value, 10) : Number(value);
      }),
    body('itens.*.observacao')
      .optional({ nullable: true, checkFalsy: true })
      .custom((value) => {
        // Se o valor existir, deve ser uma string válida
        if (value !== null && value !== undefined && value !== '') {
          if (typeof value !== 'string') {
            throw new Error('Observação do item deve ser um texto');
          }
          const trimmed = value.trim();
          if (trimmed.length > 500) {
            throw new Error('Observação do item deve ter no máximo 500 caracteres');
          }
        }
        return true;
      }),
    handleValidationErrors
  ]
};

module.exports = {
  solicitacoesComprasValidations,
  commonValidations,
  handleValidationErrors
};


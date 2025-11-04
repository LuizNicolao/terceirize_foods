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
        if (value === null || value === undefined || value === '') {
          throw new Error('Filial é obrigatória');
        }
        const num = typeof value === 'string' ? parseInt(value, 10) : value;
        if (isNaN(num) || num < 1) {
          throw new Error('Filial deve ser um ID válido');
        }
        return true;
      })
      .toInt(),
    body('data_entrega_cd')
      .isISO8601()
      .withMessage('Data de entrega CD deve ser uma data válida (formato ISO)'),
    body('motivo')
      .isIn(['Compra Emergencial', 'Compra Programada'])
      .withMessage('Motivo deve ser "Compra Emergencial" ou "Compra Programada"'),
    body('observacoes')
      .custom((value, { req }) => {
        // Se motivo for "Compra Emergencial", observações são obrigatórias
        if (req.body.motivo && req.body.motivo === 'Compra Emergencial') {
          if (!value || value.trim() === '') {
            throw new Error('Observações são obrigatórias para Compra Emergencial');
          }
        }
        return true;
      })
      .optional()
      .isString()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Observações devem ter no máximo 1000 caracteres'),
    body('itens')
      .isArray({ min: 1 })
      .withMessage('A solicitação deve ter pelo menos um item'),
    body('itens.*.produto_id')
      .notEmpty()
      .withMessage('Produto é obrigatório para cada item')
      .custom((value) => {
        if (value === null || value === undefined || value === '') {
          throw new Error('Produto é obrigatório para cada item');
        }
        const num = typeof value === 'string' ? parseInt(value, 10) : value;
        if (isNaN(num) || num < 1) {
          throw new Error('Produto deve ter um ID válido');
        }
        return true;
      })
      .toInt(),
    body('itens.*.quantidade')
      .notEmpty()
      .withMessage('Quantidade é obrigatória para cada item')
      .custom((value) => {
        if (value === null || value === undefined || value === '') {
          throw new Error('Quantidade é obrigatória para cada item');
        }
        const num = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(num) || num <= 0) {
          throw new Error('Quantidade deve ser maior que zero');
        }
        return true;
      })
      .toFloat(),
    body('itens.*.unidade_medida_id')
      .notEmpty()
      .withMessage('Unidade é obrigatória para cada item')
      .custom((value) => {
        if (value === null || value === undefined || value === '') {
          throw new Error('Unidade é obrigatória para cada item');
        }
        const num = typeof value === 'string' ? parseInt(value, 10) : value;
        if (isNaN(num) || num < 1) {
          throw new Error('Unidade deve ter um ID válido');
        }
        return true;
      })
      .toInt(),
    body('itens.*.observacao')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Observação do item deve ter no máximo 500 caracteres'),
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
        if (value === null || value === undefined || value === '') {
          throw new Error('Filial é obrigatória');
        }
        const num = typeof value === 'string' ? parseInt(value, 10) : value;
        if (isNaN(num) || num < 1) {
          throw new Error('Filial deve ser um ID válido');
        }
        return true;
      })
      .toInt(),
    body('data_entrega_cd')
      .isISO8601()
      .withMessage('Data de entrega CD deve ser uma data válida (formato ISO)'),
    body('motivo')
      .isIn(['Compra Emergencial', 'Compra Programada'])
      .withMessage('Motivo deve ser "Compra Emergencial" ou "Compra Programada"'),
    body('observacoes')
      .custom((value, { req }) => {
        // Se motivo for "Compra Emergencial", observações são obrigatórias
        if (req.body.motivo && req.body.motivo === 'Compra Emergencial') {
          if (!value || value.trim() === '') {
            throw new Error('Observações são obrigatórias para Compra Emergencial');
          }
        }
        return true;
      })
      .optional()
      .isString()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Observações devem ter no máximo 1000 caracteres'),
    body('itens')
      .isArray({ min: 1 })
      .withMessage('A solicitação deve ter pelo menos um item'),
    body('itens.*.produto_id')
      .notEmpty()
      .withMessage('Produto é obrigatório para cada item')
      .custom((value) => {
        if (value === null || value === undefined || value === '') {
          throw new Error('Produto é obrigatório para cada item');
        }
        const num = typeof value === 'string' ? parseInt(value, 10) : value;
        if (isNaN(num) || num < 1) {
          throw new Error('Produto deve ter um ID válido');
        }
        return true;
      })
      .toInt(),
    body('itens.*.quantidade')
      .notEmpty()
      .withMessage('Quantidade é obrigatória para cada item')
      .custom((value) => {
        if (value === null || value === undefined || value === '') {
          throw new Error('Quantidade é obrigatória para cada item');
        }
        const num = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(num) || num <= 0) {
          throw new Error('Quantidade deve ser maior que zero');
        }
        return true;
      })
      .toFloat(),
    body('itens.*.unidade_medida_id')
      .notEmpty()
      .withMessage('Unidade é obrigatória para cada item')
      .custom((value) => {
        if (value === null || value === undefined || value === '') {
          throw new Error('Unidade é obrigatória para cada item');
        }
        const num = typeof value === 'string' ? parseInt(value, 10) : value;
        if (isNaN(num) || num < 1) {
          throw new Error('Unidade deve ter um ID válido');
        }
        return true;
      })
      .toInt(),
    body('itens.*.observacao')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Observação do item deve ter no máximo 500 caracteres'),
    handleValidationErrors
  ]
};

module.exports = {
  solicitacoesComprasValidations,
  commonValidations,
  handleValidationErrors
};


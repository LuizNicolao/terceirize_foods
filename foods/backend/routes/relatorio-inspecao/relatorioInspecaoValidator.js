/**
 * Validações específicas para Relatório de Inspeção de Recebimento (RIR)
 * Implementa validações usando express-validator
 */

const { body, param, query } = require('express-validator');
const { createEntityValidationHandler } = require('../../middleware/validationHandler');

// Criar handler de validação específico para relatório de inspeção
const handleValidationErrors = createEntityValidationHandler('relatorio-inspecao');

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

// Validações específicas para RIR
const rirValidations = {
  create: [
    body('data_inspecao')
      .isISO8601()
      .withMessage('Data de inspeção deve ser uma data válida (formato ISO)')
      .toDate(),
    body('hora_inspecao')
      .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)
      .withMessage('Hora de inspeção deve estar no formato HH:MM:SS'),
    body('numero_nota_fiscal')
      .isLength({ min: 1, max: 50 })
      .withMessage('Número da Nota Fiscal deve ter entre 1 e 50 caracteres')
      .trim(),
    body('fornecedor')
      .isLength({ min: 1, max: 200 })
      .withMessage('Fornecedor deve ter entre 1 e 200 caracteres')
      .trim(),
    body('numero_af')
      .optional()
      .isLength({ max: 50 })
      .withMessage('Número da AF deve ter no máximo 50 caracteres')
      .trim(),
    body('numero_pedido')
      .optional()
      .isLength({ max: 50 })
      .withMessage('Número do pedido deve ter no máximo 50 caracteres')
      .trim(),
    body('cnpj_fornecedor')
      .optional()
      .isLength({ max: 20 })
      .withMessage('CNPJ deve ter no máximo 20 caracteres')
      .trim(),
    body('checklist_json')
      .optional()
      .custom((value) => {
        if (value !== null && !Array.isArray(value)) {
          throw new Error('checklist_json deve ser um array');
        }
        return true;
      }),
    body('produtos_json')
      .optional()
      .custom((value) => {
        if (value !== null && !Array.isArray(value)) {
          throw new Error('produtos_json deve ser um array');
        }
        return true;
      }),
    body('ocorrencias')
      .optional()
      .isString()
      .trim(),
    body('recebedor')
      .optional()
      .isLength({ max: 100 })
      .withMessage('Recebedor deve ter no máximo 100 caracteres')
      .trim(),
    body('visto_responsavel')
      .optional()
      .isLength({ max: 100 })
      .withMessage('Visto responsável deve ter no máximo 100 caracteres')
      .trim(),
    handleValidationErrors
  ],

  update: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID deve ser um número inteiro positivo'),
    body('data_inspecao')
      .isISO8601()
      .withMessage('Data de inspeção deve ser uma data válida (formato ISO)')
      .toDate(),
    body('hora_inspecao')
      .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)
      .withMessage('Hora de inspeção deve estar no formato HH:MM:SS'),
    body('numero_nota_fiscal')
      .isLength({ min: 1, max: 50 })
      .withMessage('Número da Nota Fiscal deve ter entre 1 e 50 caracteres')
      .trim(),
    body('fornecedor')
      .isLength({ min: 1, max: 200 })
      .withMessage('Fornecedor deve ter entre 1 e 200 caracteres')
      .trim(),
    handleValidationErrors
  ]
};

module.exports = {
  rirValidations,
  commonValidations,
  handleValidationErrors
};


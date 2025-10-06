/**
 * Validações específicas para Recebimentos Escolas
 * Implementa validações usando express-validator
 */

const { body, param, query } = require('express-validator');
const { createEntityValidationHandler } = require('../../middleware/validationHandler');

// Criar handler de validação específico para recebimentos
const handleValidationErrors = createEntityValidationHandler('recebimentos');

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

// Validações específicas para recebimentos
const recebimentosValidations = {
  create: [
    body('escola_id')
      .isInt({ min: 1 })
      .withMessage('ID da escola é obrigatório e deve ser um número inteiro positivo'),
    
    body('data_recebimento')
      .isISO8601()
      .withMessage('Data de recebimento deve ser uma data válida'),
    
    body('tipo_recebimento')
      .isIn(['Completo', 'Parcial'])
      .withMessage('Tipo de recebimento deve ser "Completo" ou "Parcial"'),
    
    body('tipo_entrega')
      .isIn(['HORTI', 'PAO', 'PERECIVEL', 'BASE SECA', 'LIMPEZA'])
      .withMessage('Tipo de entrega deve ser: HORTI, PAO, PERECIVEL, BASE SECA ou LIMPEZA'),
    
    body('semana_abastecimento')
      .optional()
      .isString()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Semana de abastecimento deve ter entre 1 e 50 caracteres'),
    
    body('observacoes')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Observações devem ter no máximo 1000 caracteres'),
    
    body('produtos')
      .optional()
      .isArray()
      .withMessage('Produtos deve ser um array'),
    
    body('produtos.*.produto_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ID do produto deve ser um número inteiro positivo'),
    
    body('produtos.*.quantidade')
      .optional()
      .isDecimal({ decimal_digits: '0,3' })
      .isFloat({ min: 0 })
      .withMessage('Quantidade deve ser um número decimal positivo'),
    
    body('produtos.*.precisa_reentrega')
      .optional()
      .isIn(['Sim', 'Não'])
      .withMessage('Precisa reentrega deve ser "Sim" ou "Não"'),
    
    handleValidationErrors
  ],

  update: [
    param('id').isInt({ min: 1 }).withMessage('ID deve ser um número inteiro positivo'),
    
    body('escola_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ID da escola deve ser um número inteiro positivo'),
    
    body('data_recebimento')
      .optional()
      .isISO8601()
      .withMessage('Data de recebimento deve ser uma data válida'),
    
    body('tipo_recebimento')
      .optional()
      .isIn(['Completo', 'Parcial'])
      .withMessage('Tipo de recebimento deve ser "Completo" ou "Parcial"'),
    
    body('tipo_entrega')
      .optional()
      .isIn(['HORTI', 'PAO', 'PERECIVEL', 'BASE SECA', 'LIMPEZA'])
      .withMessage('Tipo de entrega deve ser: HORTI, PAO, PERECIVEL, BASE SECA ou LIMPEZA'),
    
    body('semana_abastecimento')
      .optional()
      .isString()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Semana de abastecimento deve ter entre 1 e 50 caracteres'),
    
    body('observacoes')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Observações devem ter no máximo 1000 caracteres'),
    
    body('produtos')
      .optional()
      .isArray()
      .withMessage('Produtos deve ser um array'),
    
    body('produtos.*.produto_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ID do produto deve ser um número inteiro positivo'),
    
    body('produtos.*.quantidade')
      .optional()
      .isDecimal({ decimal_digits: '0,3' })
      .isFloat({ min: 0 })
      .withMessage('Quantidade deve ser um número decimal positivo'),
    
    body('produtos.*.precisa_reentrega')
      .optional()
      .isIn(['Sim', 'Não'])
      .withMessage('Precisa reentrega deve ser "Sim" ou "Não"'),
    
    handleValidationErrors
  ],

  // Validações para filtros
  filters: [
    query('escola_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ID da escola deve ser um número inteiro positivo'),
    
    query('tipo_recebimento')
      .optional()
      .isIn(['Completo', 'Parcial'])
      .withMessage('Tipo de recebimento deve ser "Completo" ou "Parcial"'),
    
    query('tipo_entrega')
      .optional()
      .isIn(['HORTI', 'PAO', 'PERECIVEL', 'BASE SECA', 'LIMPEZA'])
      .withMessage('Tipo de entrega deve ser: HORTI, PAO, PERECIVEL, BASE SECA ou LIMPEZA'),
    
    query('data_inicio')
      .optional()
      .isISO8601()
      .withMessage('Data de início deve ser uma data válida'),
    
    query('data_fim')
      .optional()
      .isISO8601()
      .withMessage('Data de fim deve ser uma data válida'),
    
    query('semana_abastecimento')
      .optional()
      .isString()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Semana de abastecimento deve ter entre 1 e 50 caracteres')
  ]
};

module.exports = {
  commonValidations,
  recebimentosValidations,
  handleValidationErrors
};

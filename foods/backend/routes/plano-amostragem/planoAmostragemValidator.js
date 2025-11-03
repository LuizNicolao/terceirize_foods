/**
 * Validações específicas para Plano de Amostragem
 * Implementa validações usando express-validator
 */

const { body, param, query } = require('express-validator');
const { createEntityValidationHandler } = require('../../middleware/validationHandler');

// Criar handler de validação específico para plano de amostragem
const handleValidationErrors = createEntityValidationHandler('plano-amostragem');

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

// Validações específicas para NQA
const nqaValidations = {
  create: [
    body('nome')
      .isLength({ min: 2, max: 100 })
      .withMessage('Nome deve ter entre 2 e 100 caracteres')
      .trim(),
    body('codigo')
      .isLength({ min: 1, max: 20 })
      .withMessage('Código deve ter entre 1 e 20 caracteres')
      .trim(),
    body('descricao')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Descrição deve ter no máximo 1000 caracteres')
      .trim(),
    body('nivel_inspecao')
      .optional()
      .isIn(['I', 'II', 'III'])
      .withMessage('Nível de inspeção deve ser I, II ou III'),
    body('ativo')
      .optional()
      .isIn([0, 1, '0', '1'])
      .withMessage('Ativo deve ser 0 (inativo) ou 1 (ativo)'),
    handleValidationErrors
  ],

  update: [
    commonValidations.id,
    body('nome')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Nome deve ter entre 2 e 100 caracteres')
      .trim(),
    body('codigo')
      .optional()
      .isLength({ min: 1, max: 20 })
      .withMessage('Código deve ter entre 1 e 20 caracteres')
      .trim(),
    body('descricao')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Descrição deve ter no máximo 1000 caracteres')
      .trim(),
    body('nivel_inspecao')
      .optional()
      .isIn(['I', 'II', 'III'])
      .withMessage('Nível de inspeção deve ser I, II ou III'),
    body('ativo')
      .optional()
      .isIn([0, 1, '0', '1'])
      .withMessage('Ativo deve ser 0 (inativo) ou 1 (ativo)'),
    handleValidationErrors
  ]
};

// Validações específicas para Tabela de Amostragem
const tabelaAmostragemValidations = {
  create: [
    body('nqa_id')
      .isInt({ min: 1 })
      .withMessage('nqa_id deve ser um número inteiro positivo'),
    body('faixa_inicial')
      .isInt({ min: 1 })
      .withMessage('Faixa inicial deve ser um número inteiro positivo'),
    body('faixa_final')
      .isInt({ min: 1 })
      .withMessage('Faixa final deve ser um número inteiro positivo'),
    body('tamanho_amostra')
      .isInt({ min: 1 })
      .withMessage('Tamanho da amostra deve ser um número inteiro positivo'),
    body('ac')
      .isInt({ min: 0 })
      .withMessage('AC deve ser um número inteiro não negativo'),
    body('re')
      .isInt({ min: 1 })
      .withMessage('RE deve ser um número inteiro positivo'),
    body('meses_validade')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Meses de validade deve ser um número positivo'),
    body('dias_validade')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Dias de validade deve ser um número inteiro não negativo'),
    body('dias_70')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Dias 70% deve ser um número inteiro não negativo'),
    body('observacoes')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Observações deve ter no máximo 1000 caracteres')
      .trim(),
    body('ativo')
      .optional()
      .isIn([0, 1, '0', '1'])
      .withMessage('Ativo deve ser 0 (inativo) ou 1 (ativo)'),
    handleValidationErrors
  ],

  update: [
    commonValidations.id,
    body('nqa_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('nqa_id deve ser um número inteiro positivo'),
    body('faixa_inicial')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Faixa inicial deve ser um número inteiro positivo'),
    body('faixa_final')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Faixa final deve ser um número inteiro positivo'),
    body('tamanho_amostra')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Tamanho da amostra deve ser um número inteiro positivo'),
    body('ac')
      .optional()
      .isInt({ min: 0 })
      .withMessage('AC deve ser um número inteiro não negativo'),
    body('re')
      .optional()
      .isInt({ min: 1 })
      .withMessage('RE deve ser um número inteiro positivo'),
    body('meses_validade')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Meses de validade deve ser um número positivo'),
    body('dias_validade')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Dias de validade deve ser um número inteiro não negativo'),
    body('dias_70')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Dias 70% deve ser um número inteiro não negativo'),
    body('observacoes')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Observações deve ter no máximo 1000 caracteres')
      .trim(),
    body('ativo')
      .optional()
      .isIn([0, 1, '0', '1'])
      .withMessage('Ativo deve ser 0 (inativo) ou 1 (ativo)'),
    handleValidationErrors
  ]
};

// Validações específicas para GruposNQA
const gruposNQAValidations = {
  vincular: [
    body('grupo_id')
      .isInt({ min: 1 })
      .withMessage('grupo_id deve ser um número inteiro positivo'),
    body('nqa_id')
      .isInt({ min: 1 })
      .withMessage('nqa_id deve ser um número inteiro positivo'),
    body('observacoes')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Observações deve ter no máximo 1000 caracteres')
      .trim(),
    handleValidationErrors
  ]
};

module.exports = {
  nqaValidations,
  tabelaAmostragemValidations,
  gruposNQAValidations,
  commonValidations,
  handleValidationErrors
};


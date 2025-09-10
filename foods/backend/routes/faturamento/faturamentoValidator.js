/**
 * Validações específicas para Faturamento
 * Centraliza todas as validações relacionadas ao faturamento
 */

const { body, param, query } = require('express-validator');
const { createEntityValidationHandler } = require('../../middleware/validationHandler');

// Criar handler de validação específico para faturamento
const handleValidationErrors = createEntityValidationHandler('faturamento');

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

// Validações específicas para faturamento
const faturamentoValidations = {
  // Validações para criação de faturamento
  create: [
    body('unidade_escolar_id')
      .notEmpty().withMessage('Unidade escolar é obrigatória')
      .isInt({ min: 1 }).withMessage('ID da unidade escolar deve ser um número inteiro positivo'),
    
    body('mes')
      .notEmpty().withMessage('Mês é obrigatório')
      .isInt({ min: 1, max: 12 }).withMessage('Mês deve ser um número entre 1 e 12'),
    
    body('ano')
      .notEmpty().withMessage('Ano é obrigatório')
      .isInt({ min: 2020, max: 2030 }).withMessage('Ano deve ser um número entre 2020 e 2030'),
    
    body('dados_faturamento')
      .isArray().withMessage('Dados de faturamento devem ser um array')
      .notEmpty().withMessage('Dados de faturamento não podem estar vazios'),
    
    body('dados_faturamento.*.dia')
      .isInt({ min: 1, max: 31 }).withMessage('Dia deve ser um número entre 1 e 31'),
    
    body('dados_faturamento.*.desjejum')
      .optional()
      .isInt({ min: 0 }).withMessage('Quantidade de desjejum deve ser um número não negativo'),
    
    body('dados_faturamento.*.lanche_matutino')
      .optional()
      .isInt({ min: 0 }).withMessage('Quantidade de lanche matutino deve ser um número não negativo'),
    
    body('dados_faturamento.*.almoco')
      .optional()
      .isInt({ min: 0 }).withMessage('Quantidade de almoço deve ser um número não negativo'),
    
    body('dados_faturamento.*.lanche_vespertino')
      .optional()
      .isInt({ min: 0 }).withMessage('Quantidade de lanche vespertino deve ser um número não negativo'),
    
    body('dados_faturamento.*.noturno')
      .optional()
      .isInt({ min: 0 }).withMessage('Quantidade de noturno deve ser um número não negativo'),
    
    body('observacoes')
      .optional()
      .isString().trim().isLength({ max: 500 }).withMessage('Observações devem ter no máximo 500 caracteres'),
    
    handleValidationErrors
  ],

  // Validações para atualização de faturamento
  update: [
    param('id').isInt({ min: 1 }).withMessage('ID deve ser um número inteiro positivo'),
    
    body('dados_faturamento')
      .optional()
      .isArray().withMessage('Dados de faturamento devem ser um array'),
    
    body('dados_faturamento.*.dia')
      .optional()
      .isInt({ min: 1, max: 31 }).withMessage('Dia deve ser um número entre 1 e 31'),
    
    body('dados_faturamento.*.desjejum')
      .optional()
      .isInt({ min: 0 }).withMessage('Quantidade de desjejum deve ser um número não negativo'),
    
    body('dados_faturamento.*.lanche_matutino')
      .optional()
      .isInt({ min: 0 }).withMessage('Quantidade de lanche matutino deve ser um número não negativo'),
    
    body('dados_faturamento.*.almoco')
      .optional()
      .isInt({ min: 0 }).withMessage('Quantidade de almoço deve ser um número não negativo'),
    
    body('dados_faturamento.*.lanche_vespertino')
      .optional()
      .isInt({ min: 0 }).withMessage('Quantidade de lanche vespertino deve ser um número não negativo'),
    
    body('dados_faturamento.*.noturno')
      .optional()
      .isInt({ min: 0 }).withMessage('Quantidade de noturno deve ser um número não negativo'),
    
    body('observacoes')
      .optional()
      .isString().trim().isLength({ max: 500 }).withMessage('Observações devem ter no máximo 500 caracteres'),
    
    handleValidationErrors
  ],

  // Validações para filtros de listagem
  filtros: [
    query('mes')
      .optional()
      .custom((value) => {
        if (value === '' || value === null || value === undefined) {
          return true; // Aceita string vazia
        }
        const num = parseInt(value);
        if (isNaN(num) || num < 1 || num > 12) {
          throw new Error('Mês deve ser um número entre 1 e 12');
        }
        return true;
      }),
    
    query('ano')
      .optional()
      .custom((value) => {
        if (value === '' || value === null || value === undefined) {
          return true; // Aceita string vazia
        }
        const num = parseInt(value);
        if (isNaN(num) || num < 2020 || num > 2030) {
          throw new Error('Ano deve ser um número entre 2020 e 2030');
        }
        return true;
      }),
    
    query('unidade_escolar_id')
      .optional()
      .custom((value) => {
        if (value === '' || value === null || value === undefined) {
          return true; // Aceita string vazia
        }
        const num = parseInt(value);
        if (isNaN(num) || num < 1) {
          throw new Error('ID da unidade escolar deve ser um número inteiro positivo');
        }
        return true;
      }),
    
    handleValidationErrors
  ]
};

module.exports = {
  faturamentoValidations,
  commonValidations
};

const { body, param, query } = require('express-validator');
const { createEntityValidationHandler } = require('../../middleware/validationHandler');

// Criar handler de validação específico para subgrupos
const handleValidationErrors = createEntityValidationHandler('subgrupos');

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

// Validações específicas para subgrupos
const subgrupoValidations = {
  create: [
    body('nome')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Nome do subgrupo deve ter entre 1 e 100 caracteres'),
    body('descricao')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Descrição deve ter no máximo 500 caracteres'),
    body('grupo_id')
      .isInt({ min: 1 })
      .withMessage('ID do grupo é obrigatório e deve ser um número válido'),
    body('status')
      .optional()
      .customSanitizer(value => {
        // Converter '1' ou 1 para 'ativo', '0' ou 0 para 'inativo'
        if (value === 1 || value === '1') return 'ativo';
        if (value === 0 || value === '0') return 'inativo';
        return value;
      })
      .isIn(['ativo', 'inativo'])
      .withMessage('Status deve ser ativo ou inativo'),
    handleValidationErrors
  ],

  update: [
    commonValidations.id,
    body('nome')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Nome do subgrupo deve ter entre 1 e 100 caracteres'),
    body('descricao')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Descrição deve ter no máximo 500 caracteres'),
    body('grupo_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ID do grupo deve ser um número válido'),
    body('status')
      .optional()
      .customSanitizer(value => {
        // Converter '1' ou 1 para 'ativo', '0' ou 0 para 'inativo'
        if (value === 1 || value === '1') return 'ativo';
        if (value === 0 || value === '0') return 'inativo';
        return value;
      })
      .isIn(['ativo', 'inativo'])
      .withMessage('Status deve ser ativo ou inativo'),
    handleValidationErrors
  ]
};

module.exports = {
  subgrupoValidations,
  commonValidations
};

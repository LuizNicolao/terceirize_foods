const { body, param, query } = require('express-validator');
const { createEntityValidationHandler } = require('../../middleware/validationHandler');

// Criar handler de validação específico para classes
const handleValidationErrors = createEntityValidationHandler('classes');

const commonValidations = {
  id: [
    body('id').isInt({ min: 1 }).withMessage('ID deve ser um número válido'),
    handleValidationErrors
  ],
  search: [
    body('search').optional().isString().withMessage('Busca deve ser uma string'),
    handleValidationErrors
  ],
  pagination: [
    body('page').optional().isInt({ min: 1 }).withMessage('Página deve ser um número válido'),
    body('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limite deve ser entre 1 e 100'),
    handleValidationErrors
  ]
};

const classeValidations = {
  create: [
    body('nome')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Nome da classe deve ter entre 1 e 100 caracteres'),
    body('descricao')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Descrição deve ter no máximo 500 caracteres'),
    body('subgrupo_id')
      .isInt({ min: 1 })
      .withMessage('ID do subgrupo é obrigatório e deve ser um número válido'),
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
    body('nome')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Nome da classe deve ter entre 1 e 100 caracteres'),
    body('descricao')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Descrição deve ter no máximo 500 caracteres'),
    body('subgrupo_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ID do subgrupo deve ser um número válido'),
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
  commonValidations,
  classeValidations
};

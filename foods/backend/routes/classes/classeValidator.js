const { body, param, query, validationResult } = require('express-validator');

// Handler de validação simples
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Dados inválidos',
      errors: errors.array()
    });
  }
  next();
};

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
      .custom((value) => {
        console.log('🔍 DEBUG VALIDADOR - status recebido:', { value, type: typeof value });
        return true; // Temporário para debug
      })
      .isIn([0, 1, '0', '1'])
      .withMessage('Status deve ser 0 (inativo) ou 1 (ativo)'),
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
      .custom((value) => {
        console.log('🔍 DEBUG VALIDADOR - status recebido:', { value, type: typeof value });
        return true; // Temporário para debug
      })
      .isIn([0, 1, '0', '1'])
      .withMessage('Status deve ser 0 (inativo) ou 1 (ativo)'),
    handleValidationErrors
  ]
};

module.exports = {
  commonValidations,
  classeValidations
};

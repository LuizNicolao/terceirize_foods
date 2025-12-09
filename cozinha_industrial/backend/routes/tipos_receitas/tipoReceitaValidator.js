const { body, param, query } = require('express-validator');
const { createEntityValidationHandler } = require('../../middleware/validationHandler');

/**
 * Validações para Tipos de Receitas
 * Segue padrão de excelência do sistema
 */

// Criar handler de validação específico para tipos de receitas
const handleValidationErrors = createEntityValidationHandler('tipos_receitas');

// Validações comuns
const commonValidations = {
  id: [
    param('id').isInt({ min: 1 }).withMessage('ID deve ser um número inteiro positivo')
  ],
  
  search: [
    query('search').optional().isString().isLength({ min: 0, max: 100 }).withMessage('Busca deve ter no máximo 100 caracteres')
  ],
  
  pagination: [
    query('page').optional().isInt({ min: 1 }).withMessage('Página deve ser um número inteiro positivo'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limite deve ser entre 1 e 100')
  ],
  
  sort: [
    query('sortBy').optional().isIn(['id', 'codigo', 'tipo_receita', 'data_cadastro', 'data_atualizacao']).withMessage('Campo de ordenação inválido'),
    query('sortOrder').optional().isIn(['ASC', 'DESC']).withMessage('Ordem de ordenação deve ser ASC ou DESC')
  ]
};

// Validações específicas para tipos de receitas
const tiposReceitasValidations = {
  criar: [
    body('tipo_receita')
      .notEmpty()
      .withMessage('Tipo de receita é obrigatório')
      .isString()
      .isLength({ min: 1, max: 255 })
      .withMessage('Tipo de receita deve ter entre 1 e 255 caracteres'),
    
    body('descricao')
      .optional()
      .isString()
      .isLength({ max: 1000 })
      .withMessage('Descrição deve ter no máximo 1000 caracteres'),
    
    body('status')
      .optional()
      .isInt({ min: 0, max: 1 })
      .withMessage('Status deve ser 0 (Inativo) ou 1 (Ativo)'),
    
    handleValidationErrors
  ],

  atualizar: [
    body('tipo_receita')
      .optional()
      .isString()
      .isLength({ min: 1, max: 255 })
      .withMessage('Tipo de receita deve ter entre 1 e 255 caracteres'),
    
    body('descricao')
      .optional()
      .isString()
      .isLength({ max: 1000 })
      .withMessage('Descrição deve ter no máximo 1000 caracteres'),
    
    body('status')
      .optional()
      .isInt({ min: 0, max: 1 })
      .withMessage('Status deve ser 0 (Inativo) ou 1 (Ativo)'),
    
    handleValidationErrors
  ],

  filtros: []
};

module.exports = {
  commonValidations,
  tiposReceitasValidations,
  handleValidationErrors
};


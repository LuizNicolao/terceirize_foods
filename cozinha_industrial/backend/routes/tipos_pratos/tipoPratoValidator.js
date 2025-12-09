const { body, param, query } = require('express-validator');
const { createEntityValidationHandler } = require('../../middleware/validationHandler');

/**
 * Validações para Tipos de Pratos
 * Segue padrão de excelência do sistema
 */

// Criar handler de validação específico para tipos de pratos
const handleValidationErrors = createEntityValidationHandler('tipos_pratos');

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
    query('sortBy').optional().isIn(['id', 'codigo', 'tipo_prato', 'data_cadastro', 'data_atualizacao']).withMessage('Campo de ordenação inválido'),
    query('sortOrder').optional().isIn(['ASC', 'DESC']).withMessage('Ordem de ordenação deve ser ASC ou DESC')
  ]
};

// Validações específicas para tipos de pratos
const tiposPratosValidations = {
  criar: [
    body('tipo_prato')
      .notEmpty()
      .withMessage('Tipo de prato é obrigatório')
      .isString()
      .isLength({ min: 1, max: 255 })
      .withMessage('Tipo de prato deve ter entre 1 e 255 caracteres'),
    
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
    body('tipo_prato')
      .optional()
      .isString()
      .isLength({ min: 1, max: 255 })
      .withMessage('Tipo de prato deve ter entre 1 e 255 caracteres'),
    
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
  tiposPratosValidations,
  handleValidationErrors
};


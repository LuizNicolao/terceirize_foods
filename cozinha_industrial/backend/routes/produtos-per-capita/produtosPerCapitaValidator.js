const { body, param, query } = require('express-validator');
const { createEntityValidationHandler } = require('../../middleware/validationHandler');

/**
 * Validações para Produtos Per Capita
 * Segue padrão de excelência do sistema
 */

// Criar handler de validação específico para produtos per capita
const handleValidationErrors = createEntityValidationHandler('produtos');

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
    query('sortBy').optional().isIn(['id', 'nome_produto', 'created_at', 'updated_at', 'ativo']).withMessage('Campo de ordenação inválido'),
    query('sortOrder').optional().isIn(['ASC', 'DESC']).withMessage('Ordem de ordenação deve ser ASC ou DESC')
  ]
};

// Validações específicas para produtos per capita
const produtosPerCapitaValidations = {
  criar: [
    body('produto_id')
      .isInt({ min: 1 })
      .withMessage('ID do produto é obrigatório e deve ser um número inteiro positivo'),
    
    body('per_capita_lanche_manha')
      .optional()
      .isDecimal({ decimal_digits: '0,6' })
      .isFloat({ min: 0, max: 999.999999 })
      .withMessage('Per capita lanche manhã deve ser um número decimal entre 0 e 999.999999'),
    
    body('per_capita_almoco')
      .optional()
      .isDecimal({ decimal_digits: '0,6' })
      .isFloat({ min: 0, max: 999.999999 })
      .withMessage('Per capita almoço deve ser um número decimal entre 0 e 999.999999'),
    
    body('per_capita_lanche_tarde')
      .optional()
      .isDecimal({ decimal_digits: '0,6' })
      .isFloat({ min: 0, max: 999.999999 })
      .withMessage('Per capita lanche tarde deve ser um número decimal entre 0 e 999.999999'),
    
    body('per_capita_parcial')
      .optional()
      .isDecimal({ decimal_digits: '0,6' })
      .isFloat({ min: 0, max: 999.999999 })
      .withMessage('Per capita parcial deve ser um número decimal entre 0 e 999.999999'),
    
    body('per_capita_eja')
      .optional()
      .isDecimal({ decimal_digits: '0,6' })
      .isFloat({ min: 0, max: 999.999999 })
      .withMessage('Per capita EJA deve ser um número decimal entre 0 e 999.999999'),
    
    body('ativo')
      .optional()
      .isBoolean()
      .withMessage('Status ativo deve ser verdadeiro ou falso'),
    
    body('observacoes')
      .optional()
      .isString()
      .isLength({ max: 500 })
      .withMessage('Observações devem ter no máximo 500 caracteres'),
    
    handleValidationErrors
  ],

  atualizar: [
    body('produto_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ID do produto deve ser um número inteiro positivo'),
    
    body('per_capita_lanche_manha')
      .optional()
      .isDecimal({ decimal_digits: '0,6' })
      .isFloat({ min: 0, max: 999.999999 })
      .withMessage('Per capita lanche manhã deve ser um número decimal entre 0 e 999.999999'),
    
    body('per_capita_almoco')
      .optional()
      .isDecimal({ decimal_digits: '0,6' })
      .isFloat({ min: 0, max: 999.999999 })
      .withMessage('Per capita almoço deve ser um número decimal entre 0 e 999.999999'),
    
    body('per_capita_lanche_tarde')
      .optional()
      .isDecimal({ decimal_digits: '0,6' })
      .isFloat({ min: 0, max: 999.999999 })
      .withMessage('Per capita lanche tarde deve ser um número decimal entre 0 e 999.999999'),
    
    body('per_capita_parcial')
      .optional()
      .isDecimal({ decimal_digits: '0,6' })
      .isFloat({ min: 0, max: 999.999999 })
      .withMessage('Per capita parcial deve ser um número decimal entre 0 e 999.999999'),
    
    body('per_capita_eja')
      .optional()
      .isDecimal({ decimal_digits: '0,6' })
      .isFloat({ min: 0, max: 999.999999 })
      .withMessage('Per capita EJA deve ser um número decimal entre 0 e 999.999999'),
    
    body('ativo')
      .optional()
      .isBoolean()
      .withMessage('Status ativo deve ser verdadeiro ou falso'),
    
    body('observacoes')
      .optional()
      .isString()
      .isLength({ max: 500 })
      .withMessage('Observações devem ter no máximo 500 caracteres'),
    
    handleValidationErrors
  ],

  buscarPorProdutos: [
    body('produto_ids')
      .isArray({ min: 1 })
      .withMessage('Lista de IDs de produtos é obrigatória'),
    
    body('produto_ids.*')
      .isInt({ min: 1 })
      .withMessage('Cada ID de produto deve ser um número inteiro positivo'),
    
    handleValidationErrors
  ],

  filtros: [
    query('status')
      .optional()
      .isIn(['todos', 'ativo', 'inativo'])
      .withMessage('Status deve ser: todos, ativo ou inativo'),
    
    query('produto_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ID do produto deve ser um número inteiro positivo')
  ]
};

module.exports = {
  commonValidations,
  produtosPerCapitaValidations,
  handleValidationErrors
};

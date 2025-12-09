const { body, param, query } = require('express-validator');
const { createEntityValidationHandler } = require('../../middleware/validationHandler');

/**
 * Validações para Receitas
 * Segue padrão de excelência do sistema
 */

// Criar handler de validação específico para receitas
const handleValidationErrors = createEntityValidationHandler('receitas');

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
    query('sortBy').optional().isIn(['id', 'codigo', 'nome', 'tipo_receita', 'filial', 'centro_custo', 'data_cadastro', 'data_atualizacao']).withMessage('Campo de ordenação inválido'),
    query('sortOrder').optional().isIn(['ASC', 'DESC']).withMessage('Ordem de ordenação deve ser ASC ou DESC')
  ]
};

// Validações específicas para receitas
const receitasValidations = {
  criar: [
    body('nome')
      .notEmpty()
      .withMessage('Nome da receita é obrigatório')
      .isString()
      .isLength({ min: 1, max: 255 })
      .withMessage('Nome da receita deve ter entre 1 e 255 caracteres'),
    
    body('descricao')
      .optional()
      .isString()
      .isLength({ max: 1000 })
      .withMessage('Descrição deve ter no máximo 1000 caracteres'),
    
    body('filial')
      .optional()
      .isString()
      .isLength({ max: 255 })
      .withMessage('Filial deve ter no máximo 255 caracteres'),
    
    body('centro_custo')
      .optional()
      .isString()
      .isLength({ max: 255 })
      .withMessage('Centro de custo deve ter no máximo 255 caracteres'),
    
    body('tipo_receita_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Tipo de receita ID deve ser um número inteiro válido'),
    
    body('tipo_receita_nome')
      .optional()
      .isString()
      .isLength({ max: 255 })
      .withMessage('Tipo de receita nome deve ter no máximo 255 caracteres'),
    
    body('status')
      .optional()
      .isInt({ min: 0, max: 1 })
      .withMessage('Status deve ser 0 (Inativo) ou 1 (Ativo)'),
    
    body('produtos')
      .optional()
      .isArray()
      .withMessage('Produtos deve ser um array'),
    
    body('produtos.*.produto_origem')
      .optional()
      .isString()
      .isLength({ max: 255 })
      .withMessage('Nome do produto origem deve ter no máximo 255 caracteres'),
    
    body('produtos.*.percapta_sugerida')
      .optional()
      .isDecimal({ decimal_digits: '0,6' })
      .isFloat({ min: 0 })
      .withMessage('Percapta sugerida deve ser um número decimal positivo'),
    
    handleValidationErrors
  ],

  atualizar: [
    body('nome')
      .optional()
      .isString()
      .isLength({ min: 1, max: 255 })
      .withMessage('Nome da receita deve ter entre 1 e 255 caracteres'),
    
    body('descricao')
      .optional()
      .isString()
      .isLength({ max: 1000 })
      .withMessage('Descrição deve ter no máximo 1000 caracteres'),
    
    body('filial')
      .optional()
      .isString()
      .isLength({ max: 255 })
      .withMessage('Filial deve ter no máximo 255 caracteres'),
    
    body('centro_custo')
      .optional()
      .isString()
      .isLength({ max: 255 })
      .withMessage('Centro de custo deve ter no máximo 255 caracteres'),
    
    body('tipo_receita_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Tipo de receita ID deve ser um número inteiro válido'),
    
    body('tipo_receita_nome')
      .optional()
      .isString()
      .isLength({ max: 255 })
      .withMessage('Tipo de receita nome deve ter no máximo 255 caracteres'),
    
    body('status')
      .optional()
      .isInt({ min: 0, max: 1 })
      .withMessage('Status deve ser 0 (Inativo) ou 1 (Ativo)'),
    
    body('produtos')
      .optional()
      .isArray()
      .withMessage('Produtos deve ser um array'),
    
    body('produtos.*.produto_origem')
      .optional()
      .isString()
      .isLength({ max: 255 })
      .withMessage('Nome do produto origem deve ter no máximo 255 caracteres'),
    
    body('produtos.*.percapta_sugerida')
      .optional()
      .isDecimal({ decimal_digits: '0,6' })
      .isFloat({ min: 0 })
      .withMessage('Percapta sugerida deve ser um número decimal positivo'),
    
    handleValidationErrors
  ],

  filtros: [
    query('tipo_receita')
      .optional()
      .isString()
      .withMessage('Tipo de receita deve ser uma string'),
    
    query('filial')
      .optional()
      .isString()
      .withMessage('Filial deve ser uma string'),
    
    query('centro_custo')
      .optional()
      .isString()
      .withMessage('Centro de custo deve ser uma string')
  ]
};

module.exports = {
  commonValidations,
  receitasValidations,
  handleValidationErrors
};


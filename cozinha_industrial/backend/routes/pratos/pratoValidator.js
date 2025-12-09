const { body, param, query } = require('express-validator');
const { createEntityValidationHandler } = require('../../middleware/validationHandler');

/**
 * Validações para Pratos
 * Segue padrão de excelência do sistema
 */

// Criar handler de validação específico para pratos
const handleValidationErrors = createEntityValidationHandler('pratos');

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
    query('sortBy').optional().isIn(['id', 'codigo', 'nome', 'tipo_prato', 'data_cadastro', 'data_atualizacao']).withMessage('Campo de ordenação inválido'),
    query('sortOrder').optional().isIn(['ASC', 'DESC']).withMessage('Ordem de ordenação deve ser ASC ou DESC')
  ]
};

// Validações específicas para pratos
const pratosValidations = {
  criar: [
    body('nome')
      .notEmpty()
      .withMessage('Nome do prato é obrigatório')
      .isString()
      .isLength({ min: 1, max: 255 })
      .withMessage('Nome do prato deve ter entre 1 e 255 caracteres'),
    
    body('descricao')
      .optional()
      .isString()
      .isLength({ max: 1000 })
      .withMessage('Descrição deve ter no máximo 1000 caracteres'),
    
    body('tipo_prato_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Tipo de prato ID deve ser um número inteiro válido'),
    
    body('tipo_prato_nome')
      .optional()
      .isString()
      .isLength({ max: 255 })
      .withMessage('Tipo de prato nome deve ter no máximo 255 caracteres'),
    
    body('filiais')
      .optional()
      .isArray()
      .withMessage('Filiais deve ser um array'),
    
    body('filiais.*.id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ID da filial deve ser um número inteiro válido'),
    
    body('filiais.*.nome')
      .optional()
      .isString()
      .isLength({ max: 255 })
      .withMessage('Nome da filial deve ter no máximo 255 caracteres'),
    
    body('centros_custo')
      .optional()
      .isArray()
      .withMessage('Centros de custo deve ser um array'),
    
    body('centros_custo.*.id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ID do centro de custo deve ser um número inteiro válido'),
    
    body('centros_custo.*.nome')
      .optional()
      .isString()
      .isLength({ max: 255 })
      .withMessage('Nome do centro de custo deve ter no máximo 255 caracteres'),
    
    body('receitas')
      .optional()
      .isArray()
      .withMessage('Receitas deve ser um array'),
    
    body('receitas.*.id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ID da receita deve ser um número inteiro válido'),
    
    body('produtos')
      .optional()
      .isArray()
      .withMessage('Produtos deve ser um array'),
    
    body('produtos.*.produto_origem_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ID do produto origem deve ser um número inteiro válido'),
    
    body('produtos.*.centro_custo_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ID do centro de custo deve ser um número inteiro válido'),
    
    body('produtos.*.percapta')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Percapta deve ser um número positivo'),
    
    body('status')
      .optional()
      .isInt({ min: 0, max: 1 })
      .withMessage('Status deve ser 0 (Inativo) ou 1 (Ativo)'),
    
    handleValidationErrors
  ],

  atualizar: [
    body('nome')
      .optional()
      .isString()
      .isLength({ min: 1, max: 255 })
      .withMessage('Nome do prato deve ter entre 1 e 255 caracteres'),
    
    body('descricao')
      .optional()
      .isString()
      .isLength({ max: 1000 })
      .withMessage('Descrição deve ter no máximo 1000 caracteres'),
    
    body('tipo_prato_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Tipo de prato ID deve ser um número inteiro válido'),
    
    body('tipo_prato_nome')
      .optional()
      .isString()
      .isLength({ max: 255 })
      .withMessage('Tipo de prato nome deve ter no máximo 255 caracteres'),
    
    body('filiais')
      .optional()
      .isArray()
      .withMessage('Filiais deve ser um array'),
    
    body('centros_custo')
      .optional()
      .isArray()
      .withMessage('Centros de custo deve ser um array'),
    
    body('receitas')
      .optional()
      .isArray()
      .withMessage('Receitas deve ser um array'),
    
    body('produtos')
      .optional()
      .isArray()
      .withMessage('Produtos deve ser um array'),
    
    body('status')
      .optional()
      .isInt({ min: 0, max: 1 })
      .withMessage('Status deve ser 0 (Inativo) ou 1 (Ativo)'),
    
    handleValidationErrors
  ],

  filtros: [
    query('tipo_prato')
      .optional()
      .isString()
      .withMessage('Tipo de prato deve ser uma string'),
    
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
  pratosValidations,
  handleValidationErrors
};


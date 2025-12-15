const { body, param, query } = require('express-validator');
const { createEntityValidationHandler } = require('../../middleware/validationHandler');

/**
 * Validações para Tipos de Cardápio
 * Segue padrão de excelência do sistema
 */

// Criar handler de validação específico para tipos de cardápio
const handleValidationErrors = createEntityValidationHandler('tipos-cardapio');

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
    query('limit').optional().isInt({ min: 1, max: 1000 }).withMessage('Limite deve ser entre 1 e 1000')
  ],
  
  sort: [
    query('sortBy').optional().isIn(['id', 'nome', 'filial_id', 'centro_custo_id', 'contrato_id', 'criado_em', 'atualizado_em']).withMessage('Campo de ordenação inválido'),
    query('sortOrder').optional().isIn(['ASC', 'DESC']).withMessage('Ordem de ordenação deve ser ASC ou DESC')
  ]
};

// Validações específicas para tipos de cardápio
const tiposCardapioValidations = {
  criar: [
    body('nome')
      .notEmpty()
      .withMessage('Nome do tipo de cardápio é obrigatório')
      .isString()
      .isLength({ min: 1, max: 255 })
      .withMessage('Nome deve ter entre 1 e 255 caracteres'),
    
    body('filial_id')
      .notEmpty()
      .withMessage('Filial é obrigatória')
      .isInt({ min: 1 })
      .withMessage('ID da filial deve ser um número inteiro positivo'),
    
    body('centro_custo_id')
      .notEmpty()
      .withMessage('Centro de custo é obrigatório')
      .isInt({ min: 1 })
      .withMessage('ID do centro de custo deve ser um número inteiro positivo'),
    
    body('contrato_id')
      .notEmpty()
      .withMessage('Contrato é obrigatório')
      .isInt({ min: 1 })
      .withMessage('ID do contrato deve ser um número inteiro positivo'),
    
    body('unidades_ids')
      .optional()
      .isArray()
      .withMessage('unidades_ids deve ser um array'),
    
    body('produtos_comerciais')
      .optional()
      .isArray()
      .withMessage('produtos_comerciais deve ser um array')
      .custom((value) => {
        if (Array.isArray(value)) {
          const allValid = value.every(produto => {
            const produtoId = typeof produto.produto_comercial_id === 'string' 
              ? parseInt(produto.produto_comercial_id, 10) 
              : produto.produto_comercial_id;
            return Number.isInteger(produtoId) && produtoId > 0;
          });
          if (!allValid) {
            throw new Error('Todos os produtos devem ter produto_comercial_id válido');
          }
        }
        return true;
      }),
    
    handleValidationErrors
  ],
  
  atualizar: [
    body('nome')
      .optional()
      .isString()
      .isLength({ min: 1, max: 255 })
      .withMessage('Nome deve ter entre 1 e 255 caracteres'),
    
    body('filial_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ID da filial deve ser um número inteiro positivo'),
    
    body('centro_custo_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ID do centro de custo deve ser um número inteiro positivo'),
    
    body('contrato_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ID do contrato deve ser um número inteiro positivo'),
    
    body('unidades_ids')
      .optional()
      .isArray()
      .withMessage('unidades_ids deve ser um array'),
    
    body('produtos_comerciais')
      .optional()
      .isArray()
      .withMessage('produtos_comerciais deve ser um array'),
    
    handleValidationErrors
  ],
  
  filtros: [
    query('filial_id').optional().isInt({ min: 1 }).withMessage('filial_id deve ser um número inteiro positivo'),
    query('centro_custo_id').optional().isInt({ min: 1 }).withMessage('centro_custo_id deve ser um número inteiro positivo'),
    query('contrato_id').optional().isInt({ min: 1 }).withMessage('contrato_id deve ser um número inteiro positivo'),
    handleValidationErrors
  ]
};

module.exports = {
  tiposCardapioValidations,
  commonValidations
};


const { body, param, query } = require('express-validator');
const { createEntityValidationHandler } = require('../../middleware/validationHandler');

/**
 * Validações para Contratos
 * Segue padrão de excelência do sistema
 */

// Criar handler de validação específico para contratos
const handleValidationErrors = createEntityValidationHandler('contratos');

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
    query('sortBy').optional().isIn(['id', 'codigo', 'nome', 'status', 'criado_em', 'atualizado_em']).withMessage('Campo de ordenação inválido'),
    query('sortOrder').optional().isIn(['ASC', 'DESC']).withMessage('Ordem de ordenação deve ser ASC ou DESC')
  ]
};

// Validações específicas para contratos
const contratosValidations = {
  criar: [
    body('nome')
      .notEmpty()
      .withMessage('Nome do contrato é obrigatório')
      .isString()
      .isLength({ min: 1, max: 255 })
      .withMessage('Nome deve ter entre 1 e 255 caracteres'),
    
    body('cliente_id')
      .notEmpty()
      .withMessage('Cliente é obrigatório')
      .isInt({ min: 1 })
      .withMessage('ID do cliente deve ser um número inteiro positivo'),
    
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
    
    body('status')
      .optional()
      .isIn(['ativo', 'inativo'])
      .withMessage('Status deve ser "ativo" ou "inativo"'),
    
    handleValidationErrors
  ],
  
  atualizar: [
    body('nome')
      .optional()
      .isString()
      .isLength({ min: 1, max: 255 })
      .withMessage('Nome deve ter entre 1 e 255 caracteres'),
    
    body('cliente_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ID do cliente deve ser um número inteiro positivo'),
    
    body('filial_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ID da filial deve ser um número inteiro positivo'),
    
    body('centro_custo_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ID do centro de custo deve ser um número inteiro positivo'),
    
    body('status')
      .optional()
      .isIn(['ativo', 'inativo'])
      .withMessage('Status deve ser "ativo" ou "inativo"'),
    
    handleValidationErrors
  ],
  
  vincularUnidades: [
    body('cozinha_industrial_ids')
      .notEmpty()
      .withMessage('Deve informar pelo menos uma unidade escolar')
      .isArray({ min: 1 })
      .withMessage('cozinha_industrial_ids deve ser um array com pelo menos um elemento')
      .custom((value) => {
        if (!Array.isArray(value) || value.length === 0) {
          throw new Error('Deve informar pelo menos uma unidade escolar');
        }
        const allValid = value.every(id => {
          const numId = typeof id === 'string' ? parseInt(id, 10) : id;
          return Number.isInteger(numId) && numId > 0;
        });
        if (!allValid) {
          throw new Error('Todos os IDs de unidade escolar devem ser números inteiros positivos');
        }
        return true;
      }),
    handleValidationErrors
  ],
  
  vincularProdutos: [
    body('produtos')
      .notEmpty()
      .withMessage('Deve informar pelo menos um produto comercial')
      .isArray({ min: 1 })
      .withMessage('produtos deve ser um array com pelo menos um elemento')
      .custom((value) => {
        if (!Array.isArray(value) || value.length === 0) {
          throw new Error('Deve informar pelo menos um produto comercial');
        }
        const allValid = value.every(produto => {
          const produtoId = typeof produto.produto_comercial_id === 'string' 
            ? parseInt(produto.produto_comercial_id, 10) 
            : produto.produto_comercial_id;
          const valor = typeof produto.valor_unitario === 'string' 
            ? parseFloat(produto.valor_unitario) 
            : produto.valor_unitario;
          return Number.isInteger(produtoId) && produtoId > 0 && 
                 !isNaN(valor) && valor > 0;
        });
        if (!allValid) {
          throw new Error('Todos os produtos devem ter produto_comercial_id válido e valor_unitario maior que zero');
        }
        return true;
      }),
    handleValidationErrors
  ],
  
  filtros: [
    query('status').optional().isIn(['ativo', 'inativo']).withMessage('Status deve ser "ativo" ou "inativo"'),
    query('centro_custo_id').optional().isInt({ min: 1 }).withMessage('centro_custo_id deve ser um número inteiro positivo'),
    query('filial_id').optional().isInt({ min: 1 }).withMessage('filial_id deve ser um número inteiro positivo'),
    handleValidationErrors
  ]
};

module.exports = {
  contratosValidations,
  commonValidations
};


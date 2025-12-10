const { body, param, query } = require('express-validator');
const { createEntityValidationHandler } = require('../../middleware/validationHandler');

/**
 * Validações para Períodos de Atendimento
 * Segue padrão de excelência do sistema
 */

// Criar handler de validação específico para períodos de atendimento
const handleValidationErrors = createEntityValidationHandler('periodos_atendimento');

// Validações comuns
const commonValidations = {
  id: [
    param('id').isInt({ min: 1 }).withMessage('ID deve ser um número inteiro positivo')
  ],
  
  unidadeId: [
    param('unidadeId').isInt({ min: 1 }).withMessage('ID da unidade deve ser um número inteiro positivo')
  ],
  
  search: [
    query('search').optional().isString().isLength({ min: 0, max: 100 }).withMessage('Busca deve ter no máximo 100 caracteres')
  ],
  
  pagination: [
    query('page').optional().isInt({ min: 1 }).withMessage('Página deve ser um número inteiro positivo'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limite deve ser entre 1 e 100')
  ],
  
  sort: [
    query('sortBy').optional().isIn(['id', 'codigo', 'nome', 'status', 'criado_em', 'atualizado_em']).withMessage('Campo de ordenação inválido'),
    query('sortOrder').optional().isIn(['ASC', 'DESC']).withMessage('Ordem de ordenação deve ser ASC ou DESC')
  ]
};

// Validações específicas para períodos de atendimento
const periodosAtendimentoValidations = {
  criar: [
    body('nome')
      .notEmpty()
      .withMessage('Nome do período é obrigatório')
      .isString()
      .isLength({ min: 1, max: 100 })
      .withMessage('Nome deve ter entre 1 e 100 caracteres'),
    
    body('codigo')
      .notEmpty()
      .withMessage('Código do período é obrigatório')
      .isString()
      .isLength({ min: 1, max: 20 })
      .withMessage('Código deve ter entre 1 e 20 caracteres')
      .matches(/^[A-Z0-9_]+$/)
      .withMessage('Código deve conter apenas letras maiúsculas, números e underscore'),
    
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
      .isLength({ min: 1, max: 100 })
      .withMessage('Nome deve ter entre 1 e 100 caracteres'),
    
    body('codigo')
      .optional()
      .isString()
      .isLength({ min: 1, max: 20 })
      .withMessage('Código deve ter entre 1 e 20 caracteres')
      .matches(/^[A-Z0-9_]+$/)
      .withMessage('Código deve conter apenas letras maiúsculas, números e underscore'),
    
    body('status')
      .optional()
      .isIn(['ativo', 'inativo'])
      .withMessage('Status deve ser "ativo" ou "inativo"'),
    
    handleValidationErrors
  ],

  vincularUnidades: [
    body('cozinha_industrial_ids')
      .isArray()
      .withMessage('cozinha_industrial_ids deve ser um array')
      .custom((value) => {
        if (!Array.isArray(value)) {
          throw new Error('cozinha_industrial_ids deve ser um array');
        }
        // Permitir array vazio para remover todos os vínculos
        if (value.length === 0) {
          return true;
        }
        // Se o array não estiver vazio, verificar se todos os elementos são números inteiros positivos
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

  filtros: []
};

module.exports = {
  commonValidations,
  periodosAtendimentoValidations,
  handleValidationErrors
};


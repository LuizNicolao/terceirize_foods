const { body, param, query } = require('express-validator');
const { createEntityValidationHandler } = require('../../middleware/validationHandler');

/**
 * Validações para Tipo de Atendimento por Escola
 * Segue padrão de excelência do sistema
 */

// Criar handler de validação específico
const handleValidationErrors = createEntityValidationHandler('tipo_atendimento_escola');

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
  ]
};

// Validações específicas para tipo atendimento escola
const tipoAtendimentoEscolaValidations = {
  criar: [
    body('escola_id')
      .isInt({ min: 1 })
      .withMessage('ID da escola é obrigatório e deve ser um número inteiro positivo'),
    
    body('tipo_atendimento')
      .isIn(['lanche_manha', 'almoco', 'lanche_tarde', 'parcial_manha', 'eja', 'parcial_tarde'])
      .withMessage('Tipo de atendimento deve ser: lanche_manha, almoco, lanche_tarde, parcial_manha, eja ou parcial_tarde'),
    
    body('ativo')
      .optional()
      .isBoolean()
      .withMessage('Ativo deve ser um valor booleano')
  ],
  
  atualizar: [
    body('ativo')
      .optional()
      .isBoolean()
      .withMessage('Ativo deve ser um valor booleano')
  ]
};

module.exports = {
  commonValidations,
  tipoAtendimentoEscolaValidations,
  handleValidationErrors
};


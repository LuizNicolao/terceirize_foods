const { body, query, validationResult } = require('express-validator');

/**
 * Validações para Quantidades Servidas (Cozinha Industrial)
 * Sistema com períodos de atendimento dinâmicos
 */

const quantidadesServidasValidations = {
  // Validação para criar registro
  criar: [
    body('unidade_id')
      .notEmpty().withMessage('Unidade é obrigatória')
      .isInt({ min: 1 }).withMessage('ID da unidade deve ser um número positivo'),
    
    body('nutricionista_id')
      .notEmpty().withMessage('Nutricionista é obrigatória')
      .isInt({ min: 1 }).withMessage('ID da nutricionista deve ser um número positivo'),
    
    body('data')
      .notEmpty().withMessage('Data é obrigatória')
      .isDate().withMessage('Data deve estar no formato YYYY-MM-DD'),
    
    body('quantidades')
      .notEmpty().withMessage('Quantidades são obrigatórias')
      .isObject().withMessage('Quantidades deve ser um objeto'),
    
    // Validação dinâmica: cada chave do objeto quantidades deve ser um período_atendimento_id válido
    // e o valor deve ser um número não-negativo
    body('quantidades.*')
      .optional()
      .isInt({ min: 0 }).withMessage('Cada quantidade deve ser um número não-negativo')
  ],
  
  // Validação para buscar por unidade e data
  buscarPorUnidadeData: [
    query('unidade_id')
      .notEmpty().withMessage('Unidade é obrigatória')
      .isInt({ min: 1 }).withMessage('ID da unidade deve ser um número positivo'),
    
    query('data')
      .notEmpty().withMessage('Data é obrigatória')
      .isDate().withMessage('Data deve estar no formato YYYY-MM-DD')
  ],
  
  // Validação para excluir
  excluir: [
    body('unidade_id')
      .notEmpty().withMessage('Unidade é obrigatória')
      .isInt({ min: 1 }).withMessage('ID da unidade deve ser um número positivo'),
    
    body('data')
      .notEmpty().withMessage('Data é obrigatória')
      .isDate().withMessage('Data deve estar no formato YYYY-MM-DD')
  ],
  
  // Validação para listar
  listar: [
    query('unidade_id')
      .optional()
      .isInt({ min: 1 }).withMessage('ID da unidade deve ser um número positivo'),
    
    query('data_inicio')
      .optional()
      .isDate().withMessage('Data início deve estar no formato YYYY-MM-DD'),
    
    query('data_fim')
      .optional()
      .isDate().withMessage('Data fim deve estar no formato YYYY-MM-DD'),
    
    query('page')
      .optional()
      .isInt({ min: 1 }).withMessage('Página deve ser um número positivo'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 }).withMessage('Limite deve estar entre 1 e 100')
  ]
};

// Middleware para tratar erros de validação
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Erros de validação',
      errors: errors.array()
    });
  }
  next();
};

module.exports = {
  quantidadesServidasValidations,
  handleValidationErrors
};


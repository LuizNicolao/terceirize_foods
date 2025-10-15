const { body, query, validationResult } = require('express-validator');

/**
 * Validações para Registros Diários
 */

const registrosDiariosValidations = {
  // Validação para criar registro
  criar: [
    body('escola_id')
      .notEmpty().withMessage('Escola é obrigatória')
      .isInt({ min: 1 }).withMessage('ID da escola deve ser um número positivo'),
    
    body('nutricionista_id')
      .notEmpty().withMessage('Nutricionista é obrigatória')
      .isInt({ min: 1 }).withMessage('ID da nutricionista deve ser um número positivo'),
    
    body('data')
      .notEmpty().withMessage('Data é obrigatória')
      .isDate().withMessage('Data deve estar no formato YYYY-MM-DD'),
    
    body('quantidades')
      .notEmpty().withMessage('Quantidades são obrigatórias')
      .isObject().withMessage('Quantidades deve ser um objeto'),
    
    body('quantidades.lanche_manha')
      .optional()
      .isInt({ min: 0 }).withMessage('Lanche manhã deve ser um número não-negativo'),
    
    body('quantidades.almoco')
      .optional()
      .isInt({ min: 0 }).withMessage('Almoço deve ser um número não-negativo'),
    
    body('quantidades.lanche_tarde')
      .optional()
      .isInt({ min: 0 }).withMessage('Lanche tarde deve ser um número não-negativo'),
    
    body('quantidades.parcial')
      .optional()
      .isInt({ min: 0 }).withMessage('Parcial deve ser um número não-negativo'),
    
    body('quantidades.eja')
      .optional()
      .isInt({ min: 0 }).withMessage('EJA deve ser um número não-negativo')
  ],
  
  // Validação para buscar por escola e data
  buscarPorEscolaData: [
    query('escola_id')
      .notEmpty().withMessage('Escola é obrigatória')
      .isInt({ min: 1 }).withMessage('ID da escola deve ser um número positivo'),
    
    query('data')
      .notEmpty().withMessage('Data é obrigatória')
      .isDate().withMessage('Data deve estar no formato YYYY-MM-DD')
  ],
  
  // Validação para excluir
  excluir: [
    body('escola_id')
      .notEmpty().withMessage('Escola é obrigatória')
      .isInt({ min: 1 }).withMessage('ID da escola deve ser um número positivo'),
    
    body('data')
      .notEmpty().withMessage('Data é obrigatória')
      .isDate().withMessage('Data deve estar no formato YYYY-MM-DD')
  ],
  
  // Validação para listar
  listar: [
    query('escola_id')
      .optional()
      .isInt({ min: 1 }).withMessage('ID da escola deve ser um número positivo'),
    
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
  registrosDiariosValidations,
  handleValidationErrors
};


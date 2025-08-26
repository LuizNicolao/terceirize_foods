/**
 * Validadores para rotas do dashboard
 * Implementa validação com express-validator
 */

const { query, validationResult } = require('express-validator');

// Middleware para capturar erros de validação
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Dados inválidos',
      errors: errors.array()
    });
  }
  next();
};

// Validações para estatísticas do dashboard
const statsValidation = [
  query('period')
    .optional()
    .isIn(['today', 'week', 'month', 'year'])
    .withMessage('Período deve ser: today, week, month ou year'),
  
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Data inicial deve estar no formato ISO 8601'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Data final deve estar no formato ISO 8601'),
  
  handleValidationErrors
];

// Validações para atividades do dashboard
const activityValidation = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit deve ser um número entre 1 e 50'),
  
  query('type')
    .optional()
    .isIn(['all', 'cotacoes', 'usuarios', 'saving'])
    .withMessage('Tipo deve ser: all, cotacoes, usuarios ou saving'),
  
  handleValidationErrors
];

module.exports = {
  statsValidation,
  activityValidation,
  handleValidationErrors
};

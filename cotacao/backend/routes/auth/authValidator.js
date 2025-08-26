/**
 * Validadores para rotas de autenticação
 * Implementa validação com express-validator
 */

const { body, validationResult } = require('express-validator');

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

// Validações para login
const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Email deve ser um endereço válido')
    .normalizeEmail(),
  
  body('senha')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres'),
  
  body('rememberMe')
    .optional()
    .isBoolean()
    .withMessage('RememberMe deve ser um valor booleano'),
  
  handleValidationErrors
];

// Validações para verificação de token
const verifyTokenValidation = [
  body('token')
    .optional()
    .isString()
    .withMessage('Token deve ser uma string'),
  
  handleValidationErrors
];

// Validações para logout
const logoutValidation = [
  // Não há validações específicas para logout
  handleValidationErrors
];

// Validações para SSO
const ssoValidation = [
  body('token')
    .isString()
    .withMessage('Token SSO é obrigatório')
    .isLength({ min: 10 })
    .withMessage('Token SSO deve ter pelo menos 10 caracteres'),
  
  handleValidationErrors
];

module.exports = {
  loginValidation,
  verifyTokenValidation,
  logoutValidation,
  ssoValidation,
  handleValidationErrors
};

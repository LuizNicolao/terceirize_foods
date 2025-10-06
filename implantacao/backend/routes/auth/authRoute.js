const express = require('express');
const { body, validationResult } = require('express-validator');
const { AuthController } = require('../../controllers/auth');
const { authenticateToken } = require('../../middleware/auth');
const { authLimiter } = require('../../middleware/rateLimiter');
const { createEntityValidationHandler } = require('../../middleware/validationHandler');

const router = express.Router();

// Validações para login
const loginValidation = [
  body('email').isEmail().withMessage('Email inválido'),
  body('senha').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres')
];

// Rotas de autenticação
router.post('/login', authLimiter, loginValidation, createEntityValidationHandler('auth'), AuthController.login);
router.get('/verify', AuthController.verifyToken);
router.post('/logout', authenticateToken, AuthController.logout);
router.get('/profile', authenticateToken, AuthController.getProfile);

module.exports = router;

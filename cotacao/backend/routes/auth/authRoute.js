/**
 * Rotas de Autenticação
 * Implementa login, logout, refresh token e validação
 */

const express = require('express');
const { authenticateToken } = require('../../middleware/auth');
const { authValidations } = require('./authValidator');
const AuthController = require('../../controllers/auth');

const router = express.Router();

// POST /cotacao/api/auth/login - Login do usuário
router.post('/login', 
  authValidations.login,
  AuthController.login
);

// POST /cotacao/api/auth/logout - Logout do usuário
router.post('/logout',
  authenticateToken,
  AuthController.logout
);

// POST /cotacao/api/auth/refresh - Renovar token
router.post('/refresh',
  authValidations.refresh,
  AuthController.refreshToken
);

// GET /cotacao/api/auth/me - Obter dados do usuário logado
router.get('/me',
  authenticateToken,
  AuthController.getCurrentUser
);

// POST /cotacao/api/auth/change-password - Alterar senha
router.post('/change-password',
  authenticateToken,
  authValidations.changePassword,
  AuthController.changePassword
);

// POST /cotacao/api/auth/forgot-password - Esqueci minha senha
router.post('/forgot-password',
  authValidations.forgotPassword,
  AuthController.forgotPassword
);

// POST /cotacao/api/auth/reset-password - Redefinir senha
router.post('/reset-password',
  authValidations.resetPassword,
  AuthController.resetPassword
);

module.exports = router;

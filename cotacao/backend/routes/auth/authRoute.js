const express = require('express');
const { authenticateToken } = require('../../middleware/auth');
const { hateoasMiddleware } = require('../../middleware/hateoas');
const AuthController = require('../../controllers/auth/AuthController');
const { 
  loginValidation, 
  verifyTokenValidation, 
  logoutValidation,
  ssoValidation 
} = require('./authValidator');

const router = express.Router();

// Aplicar middleware HATEOAS
router.use(hateoasMiddleware('auth'));

// POST /api/auth/login - Login
router.post('/login', loginValidation, AuthController.login);

// POST /api/auth/sso - SSO Login
router.post('/sso', ssoValidation, AuthController.ssoLogin);

// GET /api/auth/verify - Verificar token
router.get('/verify', authenticateToken, verifyTokenValidation, AuthController.verifyToken);

// POST /api/auth/logout - Logout
router.post('/logout', authenticateToken, logoutValidation, AuthController.logout);

// GET /api/auth/users/:userId/permissions - Buscar permissões do usuário
router.get('/users/:userId/permissions', authenticateToken, AuthController.getUserPermissions);

module.exports = router;

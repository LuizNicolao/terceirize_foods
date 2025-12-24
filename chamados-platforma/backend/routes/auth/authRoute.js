const express = require('express');
const router = express.Router();
const AuthController = require('../../controllers/auth/AuthController');
const { authenticateToken } = require('../../middleware/auth');
const { authLimiter } = require('../../middleware/rateLimiter');

// Rota de login
router.post('/login', authLimiter, AuthController.login);

// Rota para verificar token
router.get('/verify', authenticateToken, AuthController.verifyToken);

// Rota de logout
router.post('/logout', authenticateToken, AuthController.logout);

module.exports = router;


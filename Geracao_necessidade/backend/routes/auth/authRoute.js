const express = require('express');
const { authenticateToken } = require('../../middleware/auth');
const { login, verify, logout } = require('../../controllers/auth');

const router = express.Router();

// Rota de login (pública)
router.post('/login', login);

// Rota para verificar token (pública)
router.get('/verify', verify);

// Rota para logout (pública)
router.post('/logout', logout);

module.exports = router;

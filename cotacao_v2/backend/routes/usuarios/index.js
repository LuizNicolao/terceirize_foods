const express = require('express');
const router = express.Router();
const usuarioRoute = require('./usuarioRoute');

// Aplicar rotas de usuário
router.use('/', usuarioRoute);

module.exports = router;

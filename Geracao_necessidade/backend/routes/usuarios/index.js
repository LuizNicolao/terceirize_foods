const express = require('express');
const usuariosRoute = require('./usuariosRoute');

const router = express.Router();

// Usar as rotas de usuários
router.use('/', usuariosRoute);

module.exports = router;

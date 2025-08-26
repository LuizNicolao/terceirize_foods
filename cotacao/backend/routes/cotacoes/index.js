/**
 * Índice das rotas de Cotações
 * Centraliza a exportação das rotas organizadas
 */

const express = require('express');
const cotacoesRoute = require('./cotacoesRoute');

const router = express.Router();

// Usar as rotas de cotações
router.use('/', cotacoesRoute);

module.exports = router;

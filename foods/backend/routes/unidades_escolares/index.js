/**
 * Índice das rotas de Unidades Escolares
 * Centraliza a exportação das rotas organizadas
 */

const express = require('express');
const router = express.Router();

const unidadeEscolarRoute = require('./unidadeEscolarRoute');
const almoxarifadoRoute = require('./almoxarifadoRoute');

// Usar as rotas
router.use('/', unidadeEscolarRoute);
router.use('/', almoxarifadoRoute);

module.exports = router;

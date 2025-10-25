const express = require('express');
const necessidadesRoute = require('./necessidadesRoute');
const necessidadesAjusteRoute = require('./necessidadesAjusteRoute');
const necessidadesCoordenacaoRoute = require('./necessidadesCoordenacaoRoute');

const router = express.Router();

// IMPORTANTE: Rotas específicas devem vir ANTES das rotas gerais
// para evitar conflitos de roteamento
router.use('/', necessidadesAjusteRoute);
router.use('/', necessidadesCoordenacaoRoute);

// Usar as rotas de necessidades por último
router.use('/', necessidadesRoute);

module.exports = router;


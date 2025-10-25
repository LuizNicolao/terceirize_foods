const express = require('express');
const necessidadesRoute = require('./necessidadesRoute');
const necessidadesAjusteRoute = require('./necessidadesAjusteRoute');
const necessidadesCoordenacaoRoute = require('./necessidadesCoordenacaoRoute');

const router = express.Router();

// Usar as rotas de necessidades PRIMEIRO
router.use('/', necessidadesRoute);

// IMPORTANTE: Rotas específicas devem vir DEPOIS das rotas gerais
// para evitar conflitos de roteamento
router.use('/', necessidadesAjusteRoute);
router.use('/', necessidadesCoordenacaoRoute);

module.exports = router;


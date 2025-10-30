const express = require('express');
const necessidadesRoute = require('./necessidadesRoute');
const necessidadesAjusteRoute = require('./necessidadesAjusteRoute');
const necessidadesCoordenacaoRoute = require('./necessidadesCoordenacaoRoute');
const necessidadesLogisticaRoute = require('./necessidadesLogisticaRoute');

const router = express.Router();

// IMPORTANTE: Rotas de ajuste devem vir ANTES das rotas com parâmetros (/:id)
// para evitar que /ajuste seja capturado como /:id
router.use('/', necessidadesAjusteRoute);
router.use('/', necessidadesCoordenacaoRoute);
router.use('/', necessidadesLogisticaRoute);

// Usar as rotas de necessidades
router.use('/', necessidadesRoute);

module.exports = router;


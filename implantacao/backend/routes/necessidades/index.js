const express = require('express');
const necessidadesRoute = require('./necessidadesRoute');
const necessidadesEspecificasRoute = require('./necessidadesEspecificasRoute');
const necessidadesAjusteRoute = require('./necessidadesAjusteRoute');
const necessidadesCoordenacaoRoute = require('./necessidadesCoordenacaoRoute');

const router = express.Router();

// IMPORTANTE: Ordem das rotas para evitar conflitos
// 1. Rotas específicas PRIMEIRO (para evitar interceptação)
router.use('/', necessidadesEspecificasRoute);
router.use('/', necessidadesAjusteRoute);
router.use('/', necessidadesCoordenacaoRoute);

// 2. Rotas gerais DEPOIS (necessidadesRoute)
router.use('/', necessidadesRoute);

module.exports = router;


const express = require('express');
const necessidadesRoute = require('./necessidadesRoute');
const necessidadesEspecificasRoute = require('./necessidadesEspecificasRoute');
const necessidadesAjusteRoute = require('./necessidadesAjusteRoute');
const necessidadesCoordenacaoRoute = require('./necessidadesCoordenacaoRoute');

const router = express.Router();

// IMPORTANTE: Ordem das rotas para evitar conflitos
// 1. Rotas gerais PRIMEIRO (necessidadesRoute)
router.use('/', necessidadesRoute);

// 2. Rotas específicas DEPOIS (para evitar interceptação)
router.use('/', necessidadesEspecificasRoute);
router.use('/', necessidadesAjusteRoute);
router.use('/', necessidadesCoordenacaoRoute);

module.exports = router;


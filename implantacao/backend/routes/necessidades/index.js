const express = require('express');
const necessidadesRoute = require('./necessidadesRoute');
const necessidadesEspecificasRoute = require('./necessidadesEspecificasRoute');
const necessidadesAjusteRoute = require('./necessidadesAjusteRoute');
const necessidadesCoordenacaoRoute = require('./necessidadesCoordenacaoRoute');

const router = express.Router();

// IMPORTANTE: Ordem das rotas para evitar conflitos
// 1. Rotas mais específicas primeiro (gerar, escolas-nutricionista)
router.use('/', necessidadesEspecificasRoute);

// 2. Rotas de funcionalidades específicas (ajuste, coordenação)
router.use('/', necessidadesAjusteRoute);
router.use('/', necessidadesCoordenacaoRoute);

// 3. Rotas gerais por último
router.use('/', necessidadesRoute);

module.exports = router;


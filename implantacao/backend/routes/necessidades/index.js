const express = require('express');
const necessidadesRoute = require('./necessidadesRoute');
const necessidadesAjusteRoute = require('./necessidadesAjusteRoute');

const router = express.Router();

// Usar as rotas de necessidades
router.use('/', necessidadesRoute);

// Usar as rotas de ajuste de necessidades
router.use('/', necessidadesAjusteRoute);

module.exports = router;


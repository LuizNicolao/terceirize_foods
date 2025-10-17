const express = require('express');
const necessidadesRoute = require('./necessidadesRoute');

const router = express.Router();

// Usar as rotas de necessidades
router.use('/', necessidadesRoute);

module.exports = router;


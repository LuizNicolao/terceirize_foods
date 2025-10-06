const express = require('express');
const tiposEntregaRoute = require('./tiposEntregaRoute');

const router = express.Router();

// Usar as rotas de tipos de entrega
router.use('/', tiposEntregaRoute);

module.exports = router;

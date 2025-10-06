const express = require('express');
const permissoesRoute = require('./permissoesRoute');

const router = express.Router();

// Usar as rotas de permissões
router.use('/', permissoesRoute);

module.exports = router;

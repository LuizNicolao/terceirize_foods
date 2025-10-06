const express = require('express');
const authRoute = require('./authRoute');

const router = express.Router();

// Usar as rotas de autenticação
router.use('/', authRoute);

module.exports = router;

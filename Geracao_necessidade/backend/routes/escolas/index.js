const express = require('express');
const escolasRoute = require('./escolasRoute');

const router = express.Router();

// Usar as rotas de escolas
router.use('/', escolasRoute);

module.exports = router;

const express = require('express');
const produtosRoute = require('./produtosRoute');

const router = express.Router();

// Usar as rotas de produtos
router.use('/', produtosRoute);

module.exports = router;

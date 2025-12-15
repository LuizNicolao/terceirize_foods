const express = require('express');
const router = express.Router();
const tiposCardapioRoute = require('./tiposCardapioRoute');

router.use('/', tiposCardapioRoute);

module.exports = router;


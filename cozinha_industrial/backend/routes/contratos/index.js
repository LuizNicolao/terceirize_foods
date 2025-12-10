const express = require('express');
const router = express.Router();
const contratoRoute = require('./contratoRoute');

router.use('/', contratoRoute);

module.exports = router;


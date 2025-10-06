const express = require('express');
const dashboardRoute = require('./dashboardRoute');

const router = express.Router();

// Usar as rotas do dashboard
router.use('/', dashboardRoute);

module.exports = router;

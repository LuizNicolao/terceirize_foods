const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Middleware de autenticação
const { auth } = require('../middleware/auth');

// GET /api/dashboard/stats - Buscar estatísticas do dashboard
router.get('/stats', auth, dashboardController.getStats);

// GET /api/dashboard/activity - Buscar atividades recentes
router.get('/activity', auth, dashboardController.getActivity);

// GET /api/dashboard/charts - Buscar dados para gráficos
router.get('/charts', auth, dashboardController.getCharts);

module.exports = router; 
const express = require('express');
const router = express.Router();
const { DashboardController } = require('../../controllers/dashboard');
const { hateoasMiddleware } = require('../../middleware/hateoas');
const { statsValidation, activityValidation } = require('./dashboardValidator');

// Middleware de autenticação
const { authenticateToken: auth } = require('../../middleware/auth');

// Aplicar middleware HATEOAS
router.use(hateoasMiddleware('dashboard'));

// GET /api/dashboard/stats - Buscar estatísticas do dashboard
router.get('/stats', auth, statsValidation, DashboardController.getStats);

// GET /api/dashboard/recent - Buscar cotações recentes
router.get('/recent', auth, DashboardController.getRecent);

// GET /api/dashboard/alerts - Buscar alertas
router.get('/alerts', auth, DashboardController.getAlerts);

// GET /api/dashboard/activity - Buscar atividades recentes
router.get('/activity', auth, activityValidation, DashboardController.getActivity);

module.exports = router;

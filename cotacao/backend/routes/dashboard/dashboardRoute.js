/**
 * Rotas do Dashboard
 * Implementa estatísticas e dados principais do sistema
 */

const express = require('express');
const { authenticateToken } = require('../../middleware/auth');
const DashboardController = require('../../controllers/dashboard');

const router = express.Router();

// GET /cotacao/api/dashboard/stats - Estatísticas gerais
router.get('/stats',
  authenticateToken,
  DashboardController.getStats
);

// GET /cotacao/api/dashboard/chart-cotacoes - Gráfico de cotações por mês
router.get('/chart-cotacoes',
  authenticateToken,
  DashboardController.getCotacoesChart
);

// GET /cotacao/api/dashboard/recent-activities - Atividades recentes
router.get('/recent-activities',
  authenticateToken,
  DashboardController.getRecentActivities
);

module.exports = router;

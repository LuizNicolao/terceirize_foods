/**
 * Rotas de Dashboard
 */

const express = require('express');
const { authenticateToken, checkPermission } = require('../../middleware/auth');
const DashboardController = require('../../controllers/dashboard/DashboardController');
const { query } = require('express-validator');

const router = express.Router();

// Aplicar middleware de autenticação
router.use(authenticateToken);

// GET /api/dashboard/estatisticas - Obter estatísticas do dashboard
router.get('/estatisticas',
  checkPermission('visualizar'),
  DashboardController.obterEstatisticas
);

// GET /api/dashboard/temporal - Obter dados temporais para gráficos
router.get('/temporal',
  checkPermission('visualizar'),
  query('dias').optional().isInt({ min: 1, max: 365 }).withMessage('Dias deve ser entre 1 e 365'),
  DashboardController.obterDadosTemporais
);

module.exports = router;


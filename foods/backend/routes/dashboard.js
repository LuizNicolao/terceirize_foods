const express = require('express');
const { authenticateToken, checkScreenPermission } = require('../middleware/auth');
const { hateoasMiddleware } = require('../middleware/hateoas');
const DashboardController = require('../controllers/dashboard');

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// ===== ROTAS PRINCIPAIS DO DASHBOARD =====

// Obter estatísticas gerais da dashboard
router.get('/stats', 
  checkScreenPermission('dashboard', 'visualizar'),
  DashboardController.obterEstatisticas,
  hateoasMiddleware
);

// Obter dados recentes da dashboard
router.get('/recentes', 
  checkScreenPermission('dashboard', 'visualizar'),
  DashboardController.obterDadosRecentes,
  hateoasMiddleware
);

// Obter alertas da dashboard
router.get('/alertas', 
  checkScreenPermission('dashboard', 'visualizar'),
  DashboardController.obterAlertas,
  hateoasMiddleware
);

module.exports = router; 
const express = require('express');
const { authenticateToken, checkPermission } = require('../middleware/auth');
const { hateoasMiddleware } = require('../middleware/hateoas');
const dashboardController = require('../controllers/dashboardController');

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// ===== ROTAS PRINCIPAIS DO DASHBOARD =====

// Obter estatísticas gerais da dashboard
router.get('/stats', 
  // checkPermission('visualizar'), // Temporariamente removido para debug
  dashboardController.obterEstatisticas
  // hateoasMiddleware // Temporariamente removido para debug
);

// Obter estatísticas por filial
router.get('/filial/:filialId/stats', 
  checkPermission('visualizar'),
  dashboardController.obterEstatisticasPorFilial,
  hateoasMiddleware
);

// Obter alertas do sistema
router.get('/alertas', 
  checkPermission('visualizar'),
  dashboardController.obterAlertas,
  hateoasMiddleware
);

module.exports = router; 
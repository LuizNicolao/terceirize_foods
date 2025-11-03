const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { canView } = require('../middleware/permissoes');
const DashboardController = require('../controllers/dashboard');

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// GET /api/dashboard/estatisticas - Obter estatísticas gerais
router.get('/estatisticas', canView('dashboard'), DashboardController.obterEstatisticas);

// GET /api/dashboard/resumo-executivo - Obter resumo executivo
router.get('/resumo-executivo', canView('dashboard'), DashboardController.obterResumoExecutivo);

module.exports = router;


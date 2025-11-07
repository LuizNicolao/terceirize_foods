const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const DashboardController = require('../controllers/dashboard');

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// GET /api/dashboard/estatisticas - Obter estatísticas gerais
router.get('/estatisticas', DashboardController.obterEstatisticas);

// GET /api/dashboard/resumo-executivo - Obter resumo executivo
router.get('/resumo-executivo', DashboardController.obterResumoExecutivo);

module.exports = router;


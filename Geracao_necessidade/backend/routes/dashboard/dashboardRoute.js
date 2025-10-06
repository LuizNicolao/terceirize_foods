const express = require('express');
const { authenticateToken } = require('../../middleware/auth');
const { hateoasMiddleware } = require('../../middleware/hateoas');
const {
  obterEstatisticas,
  obterDadosRecentes,
  obterAlertas,
  obterMetricas,
  obterGraficos
} = require('../../controllers/dashboard');

const router = express.Router();

// Aplicar middlewares globais
router.use(authenticateToken);
router.use(hateoasMiddleware('dashboard'));

// ===== ROTAS PRINCIPAIS DO DASHBOARD =====

// Obter estatísticas gerais da dashboard
router.get('/stats', obterEstatisticas);

// Obter dados recentes da dashboard
router.get('/recentes', obterDadosRecentes);

// Obter alertas da dashboard
router.get('/alertas', obterAlertas);

// Obter métricas de performance
router.get('/metricas', obterMetricas);

// Obter gráficos de dados
router.get('/graficos', obterGraficos);

module.exports = router;

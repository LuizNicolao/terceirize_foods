const express = require('express');
const { authenticateToken } = require('../../middleware/auth');
const { canView } = require('../../middleware/permissoes');
const { paginationMiddleware } = require('../../middleware/pagination');
const { 
  relatorioPendencias, 
  relatorioCompletos, 
  dashboardRelatorios,
  listar,
  obterEstatisticas,
  obterResumo
} = require('../../controllers/recebimentos-relatorios');

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// Middleware específico para relatórios - apenas Coordenadores e Supervisores
// router.use(canView('recebimentos-escolas'));

// Rotas de relatórios
router.get('/pendencias', paginationMiddleware, relatorioPendencias);
router.get('/completos', paginationMiddleware, relatorioCompletos);
router.get('/dashboard', dashboardRelatorios);

// Rotas de estatísticas
router.get('/estatisticas', obterEstatisticas);
router.get('/resumo', obterResumo);

// Rota geral de listagem
router.get('/', listar);

module.exports = router;
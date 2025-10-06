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
const canViewRelatorios = (req, res, next) => {
  const userType = req.user.tipo_usuario;
  
  if (!['Coordenacao', 'Supervisao'].includes(userType)) {
    return res.status(403).json({
      error: 'Acesso negado',
      message: 'Apenas Coordenadores e Supervisores podem acessar relatórios'
    });
  }
  
  next();
};

// Aplicar middleware de relatórios em todas as rotas
router.use(canViewRelatorios);

// ===== ROTAS DE RELATÓRIOS =====
router.get('/pendencias', canView('recebimentos-escolas'), paginationMiddleware, relatorioPendencias);
router.get('/completos', canView('recebimentos-escolas'), paginationMiddleware, relatorioCompletos);
router.get('/dashboard', canView('recebimentos-escolas'), dashboardRelatorios);

// ===== ROTAS DE LISTAGEM =====
router.get('/', canView('recebimentos-escolas'), listar);

// ===== ROTAS DE ESTATÍSTICAS =====
router.get('/stats/estatisticas', canView('recebimentos-escolas'), obterEstatisticas);
router.get('/stats/resumo', canView('recebimentos-escolas'), obterResumo);

module.exports = router;

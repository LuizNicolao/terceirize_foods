/**
 * Rotas para Cotações
 * Implementa endpoints RESTful para operações de cotações
 */

const express = require('express');
const router = express.Router();

// Middlewares
const { handleValidationErrors } = require('../../middleware/validation');
const { errorHandler } = require('../../middleware/responseHandler');

// Controllers
const {
  CotacoesCRUDController,
  CotacoesListController,
  CotacoesSearchController,
  CotacoesStatsController
} = require('../../controllers/cotacoes');

// Validators
const {
  criarCotacaoValidation,
  atualizarCotacaoValidation,
  listarCotacoesValidation,
  excluirCotacaoValidation
} = require('./cotacaoValidator');

// Middleware de autenticação
const { authenticateToken, canEditCotacao } = require('../../middleware/auth');

// ===== ROTAS CRUD =====
router.post('/', 
  authenticateToken,
  criarCotacaoValidation,
  handleValidationErrors,
  CotacoesCRUDController.criarCotacao
);

router.get('/:id', 
  authenticateToken,
  CotacoesCRUDController.buscarCotacao
);

router.put('/:id', 
  authenticateToken,
  canEditCotacao,
  atualizarCotacaoValidation,
  handleValidationErrors,
  CotacoesCRUDController.atualizarCotacao
);

router.delete('/:id', 
  authenticateToken,
  canEditCotacao,
  excluirCotacaoValidation,
  handleValidationErrors,
  CotacoesCRUDController.excluirCotacao
);

// ===== ROTAS DE LISTAGEM =====
router.get('/', 
  authenticateToken,
  listarCotacoesValidation,
  handleValidationErrors,
  CotacoesListController.listarCotacoes
);

// Rotas específicas de listagem
router.get('/pendentes-supervisor', 
  authenticateToken,
  CotacoesListController.listarCotacoesPendentesSupervisor
);

router.get('/aprovacoes', 
  authenticateToken,
  CotacoesListController.listarCotacoesAprovacao
);

// ===== ROTAS DE BUSCA =====
router.get('/buscar/status/:status', 
  authenticateToken,
  CotacoesSearchController.buscarPorStatus
);

router.get('/buscar/comprador/:comprador_id', 
  authenticateToken,
  CotacoesSearchController.buscarPorComprador
);

// ===== ROTAS DE ESTATÍSTICAS =====
router.get('/stats/overview', 
  authenticateToken,
  CotacoesStatsController.buscarEstatisticas
);

router.get('/stats/dashboard', 
  authenticateToken,
  CotacoesStatsController.buscarDashboardOverview
);

router.get('/stats/periodo', 
  authenticateToken,
  CotacoesStatsController.buscarEstatisticasPorPeriodo
);

router.get('/stats/comprador/:comprador_id', 
  authenticateToken,
  CotacoesStatsController.buscarEstatisticasPorComprador
);

// Middleware de tratamento de erros
router.use(errorHandler);

module.exports = router;

const express = require('express');
const { authenticateToken } = require('../../middleware/auth');
const { canView, canCreate, canEdit, canDelete } = require('../../middleware/permissoes');
const { paginationMiddleware } = require('../../middleware/pagination');
const {
  listar,
  buscarPorId,
  criar,
  atualizar,
  deletar,
  listarProdutosDisponiveis,
  listarTodosProdutos,
  buscarPorProdutos,
  obterEstatisticas,
  obterResumo
} = require('../../controllers/produtos-per-capita');

const router = express.Router();

router.use(authenticateToken);

// ===== ROTAS ESPECÍFICAS (DEVEM VIR ANTES DAS ROTAS COM PARÂMETROS) =====
router.get('/produtos-disponiveis', canView('produtos-per-capita'), listarProdutosDisponiveis);
router.get('/todos-produtos', canView('produtos-per-capita'), listarTodosProdutos);
router.post('/buscar-por-produtos', canView('produtos-per-capita'), buscarPorProdutos);

// ===== ROTAS CRUD =====
router.get('/', paginationMiddleware, canView('produtos-per-capita'), listar);
router.get('/:id', canView('produtos-per-capita'), buscarPorId);
router.post('/', canCreate('produtos-per-capita'), criar);
router.put('/:id', canEdit('produtos-per-capita'), atualizar);
router.delete('/:id', canDelete('produtos-per-capita'), deletar);

// ===== ROTAS DE ESTATÍSTICAS =====
router.get('/stats/estatisticas', canView('produtos-per-capita'), obterEstatisticas);
router.get('/stats/resumo', canView('produtos-per-capita'), obterResumo);

module.exports = router;

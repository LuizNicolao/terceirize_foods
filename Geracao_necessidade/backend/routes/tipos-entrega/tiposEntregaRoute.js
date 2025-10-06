const express = require('express');
const { authenticateToken } = require('../../middleware/auth');
const { canView, canCreate, canEdit, canDelete } = require('../../middleware/permissoes');
const { 
  listar, 
  listarTodas, 
  obterEstatisticas, 
  obterResumo,
  criar,
  atualizar,
  deletar,
  buscarPorId
} = require('../../controllers/tipos-entrega');

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// ===== ROTAS CRUD =====
router.get('/', canView('tipos-entrega'), listar);
router.get('/todas', canView('tipos-entrega'), listarTodas);
router.get('/:id', canView('tipos-entrega'), buscarPorId);
router.post('/', canCreate('tipos-entrega'), criar);
router.put('/:id', canEdit('tipos-entrega'), atualizar);
router.delete('/:id', canDelete('tipos-entrega'), deletar);

// ===== ROTAS DE ESTATÍSTICAS =====
router.get('/stats/estatisticas', canView('tipos-entrega'), obterEstatisticas);
router.get('/stats/resumo', canView('tipos-entrega'), obterResumo);

module.exports = router;

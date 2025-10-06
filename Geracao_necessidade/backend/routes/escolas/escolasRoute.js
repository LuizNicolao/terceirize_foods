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
} = require('../../controllers/escolas');

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// ===== ROTAS CRUD =====
router.get('/', canView('escolas'), listar);
router.get('/todas', canView('escolas'), listarTodas);
router.get('/:id', canView('escolas'), buscarPorId);
router.post('/', canCreate('escolas'), criar);
router.put('/:id', canEdit('escolas'), atualizar);
router.delete('/:id', canDelete('escolas'), deletar);

// ===== ROTAS DE ESTATÍSTICAS =====
router.get('/stats/estatisticas', canView('escolas'), obterEstatisticas);
router.get('/stats/resumo', canView('escolas'), obterResumo);

module.exports = router;

const express = require('express');
const { authenticateToken } = require('../../middleware/auth');
const { canView, canCreate, canEdit, canDelete } = require('../../middleware/permissoes');
const { 
  listar, 
  buscarPorGrupo, 
  buscarGrupos,
  obterEstatisticas,
  obterResumo,
  criar,
  atualizar,
  deletar,
  buscarPorId
} = require('../../controllers/produtos');

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// ===== ROTAS ESPECÍFICAS (DEVEM VIR ANTES DAS ROTAS COM PARÂMETROS) =====
router.get('/grupo/:grupoId', canView('necessidades'), buscarPorGrupo);
router.get('/grupos', canView('necessidades'), buscarGrupos);

// ===== ROTAS CRUD =====
router.get('/', canView('produtos'), listar);
router.get('/:id', canView('produtos'), buscarPorId);
router.post('/', canCreate('produtos'), criar);
router.put('/:id', canEdit('produtos'), atualizar);
router.delete('/:id', canDelete('produtos'), deletar);

// ===== ROTAS DE ESTATÍSTICAS =====
router.get('/stats/estatisticas', canView('produtos'), obterEstatisticas);
router.get('/stats/resumo', canView('produtos'), obterResumo);

module.exports = router;

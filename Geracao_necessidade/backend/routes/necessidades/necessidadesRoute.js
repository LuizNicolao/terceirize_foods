const express = require('express');
const { authenticateToken } = require('../../middleware/auth');
const { canView, canCreate, canEdit, canDelete } = require('../../middleware/permissoes');
const { 
  listar, 
  listarTodas,
  criar, 
  atualizar, 
  deletar, 
  buscarPorId,
  obterEstatisticas,
  obterResumo,
  gerarNecessidade
} = require('../../controllers/necessidades');
const { listar: listarEscolas } = require('../../controllers/escolas/EscolasListController');
const { 
  validateCriarNecessidade, 
  validateGerarNecessidade, 
  validateAtualizarNecessidade 
} = require('./necessidadesValidator');

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// ===== ROTAS ESPECÍFICAS (DEVEM VIR ANTES DAS ROTAS COM PARÂMETROS) =====
router.get('/escolas', canView('necessidades'), listarEscolas);
router.post('/gerar', canCreate('necessidades'), validateGerarNecessidade, gerarNecessidade);

// ===== ROTAS CRUD =====
router.get('/', canView('necessidades'), listar);
router.get('/todas', canView('necessidades'), listarTodas);
router.get('/:id', canView('necessidades'), buscarPorId);
router.post('/', canCreate('necessidades'), validateCriarNecessidade, criar);
router.put('/:id', canEdit('necessidades'), validateAtualizarNecessidade, atualizar);
router.delete('/:id', canDelete('necessidades'), deletar);

// ===== ROTAS DE ESTATÍSTICAS =====
router.get('/stats/estatisticas', canView('necessidades'), obterEstatisticas);
router.get('/stats/resumo', canView('necessidades'), obterResumo);

module.exports = router;

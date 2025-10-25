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
  gerarNecessidade,
  listarEscolasNutricionista,
  exportarXLSX,
  exportarPDF
} = require('../../controllers/necessidades');
const { 
  validateCriarNecessidade, 
  validateGerarNecessidade, 
  validateAtualizarNecessidade 
} = require('./necessidadesValidator');

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// ===== ROTAS ESPECÍFICAS (DEVEM VIR ANTES DAS ROTAS COM PARÂMETROS) =====
router.post('/gerar', canCreate('necessidades'), validateGerarNecessidade, gerarNecessidade);
router.get('/escolas-nutricionista/:usuarioId', canView('necessidades'), listarEscolasNutricionista);

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

// ===== ROTAS DE EXPORTAÇÃO =====
router.get('/exportar/xlsx', canView('necessidades'), exportarXLSX);
router.get('/exportar/pdf', canView('necessidades'), exportarPDF);

module.exports = router;

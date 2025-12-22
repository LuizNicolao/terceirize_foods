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
  exportarPDF,
  importarExcel,
  baixarModelo,
  corrigirNecessidade,
  buscarNecessidadeParaCorrecao,
  excluirNecessidade,
  buscarStatusDisponiveis
} = require('../../controllers/necessidades');

const { uploadMiddleware } = require('../../controllers/necessidades/NecessidadesImportController');
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
router.get('/status/disponiveis', canView('necessidades'), buscarStatusDisponiveis);

// ===== ROTAS DE IMPORTAÇÃO =====
router.post('/importar', canCreate('necessidades'), uploadMiddleware, importarExcel);
router.get('/modelo', canCreate('necessidades'), baixarModelo);

// ===== ROTAS DE ESTATÍSTICAS =====
router.get('/stats/estatisticas', canView('necessidades'), obterEstatisticas);
router.get('/stats/resumo', canView('necessidades'), obterResumo);

// ===== ROTAS DE EXPORTAÇÃO =====
router.get('/exportar/xlsx', canView('necessidades'), exportarXLSX);
router.get('/exportar/pdf', canView('necessidades'), exportarPDF);

// ===== ROTAS DE CORREÇÃO =====
router.get('/correcao/:necessidade_id', canEdit('necessidades'), buscarNecessidadeParaCorrecao);
router.put('/correcao/:necessidade_id', canEdit('necessidades'), corrigirNecessidade);
router.delete('/correcao/:necessidade_id', canEdit('necessidades'), excluirNecessidade);

// ===== ROTAS CRUD =====
router.get('/', canView('necessidades'), listar);
router.get('/todas', canView('necessidades'), listarTodas);
router.get('/:id', canView('necessidades'), buscarPorId);
router.post('/', canCreate('necessidades'), validateCriarNecessidade, criar);
router.put('/:id', canEdit('necessidades'), validateAtualizarNecessidade, atualizar);
router.delete('/:id', canDelete('necessidades'), deletar);

module.exports = router;

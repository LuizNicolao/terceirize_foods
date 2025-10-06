const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middleware/auth');
const { recebimentosLimiter } = require('../../middleware/rateLimiter');
const { createEntityValidationHandler } = require('../../middleware/validationHandler');
const { commonValidations, recebimentosValidations } = require('./recebimentosEscolasValidator');
const {
  listar,
  listarTodas,
  buscarPorId,
  criar,
  atualizar,
  deletar,
  obterEstatisticas,
  obterResumo,
  listarProdutosPorTipo,
  listarEscolasNutricionista,
  exportarXLSX,
  exportarPDF
} = require('../../controllers/recebimentos-escolas');
const { 
  canView, 
  canCreate, 
  canEdit, 
  canDelete 
} = require('../../middleware/permissoes');

// Importar rotas de relatórios
const relatoriosRouter = require('./relatoriosRoute');

router.use(recebimentosLimiter);
router.use(authenticateToken);

// ===== ROTAS ESPECÍFICAS (DEVEM VIR ANTES DAS ROTAS COM PARÂMETROS) =====
router.use('/relatorios', relatoriosRouter);
router.get('/escolas-nutricionista/:usuarioId', canView('recebimentos-escolas'), listarEscolasNutricionista);
router.get('/produtos', canView('recebimentos-escolas'), listarProdutosPorTipo);

// ===== ROTAS DE ESTATÍSTICAS (DEVEM VIR ANTES DAS ROTAS COM PARÂMETROS) =====
router.get('/estatisticas', canView('recebimentos-escolas'), obterEstatisticas);
router.get('/resumo', canView('recebimentos-escolas'), obterResumo);

// ===== ROTAS DE EXPORTAÇÃO (DEVEM VIR ANTES DAS ROTAS COM PARÂMETROS) =====
router.get('/exportar/xlsx', canView('recebimentos-escolas'), recebimentosValidations.filters, exportarXLSX);
router.get('/exportar/pdf', canView('recebimentos-escolas'), recebimentosValidations.filters, exportarPDF);

// ===== ROTAS CRUD =====
router.get('/', canView('recebimentos-escolas'), recebimentosValidations.filters, listar);
router.get('/todas', canView('recebimentos-escolas'), recebimentosValidations.filters, listarTodas);
router.get('/:id', canView('recebimentos-escolas'), commonValidations.id, buscarPorId);
router.post('/', canCreate('recebimentos-escolas'), recebimentosValidations.create, criar);
router.put('/:id', canEdit('recebimentos-escolas'), recebimentosValidations.update, atualizar);
router.delete('/:id', canDelete('recebimentos-escolas'), commonValidations.id, deletar);

module.exports = router;

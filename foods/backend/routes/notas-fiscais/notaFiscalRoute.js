/**
 * Rotas de Notas Fiscais
 * Implementa padrões RESTful com HATEOAS, paginação e validação
 */

const express = require('express');
const { authenticateToken, checkScreenPermission } = require('../../middleware/auth');
const { notaFiscalValidations, commonValidations } = require('./notaFiscalValidator');
const { paginationMiddleware } = require('../../middleware/pagination');
const { hateoasMiddleware } = require('../../middleware/hateoas');
const { auditMiddleware, AUDIT_ACTIONS } = require('../../utils/audit');
const NotasFiscaisController = require('../../controllers/notas-fiscais');
const { uploadNotaFiscal, handleUploadError } = require('../../middleware/uploadNotaFiscal');
const parseFormData = require('../../middleware/parseFormData');
const { NotaFiscalImportController, upload } = require('../../controllers/notas-fiscais/NotaFiscalImportController');

const router = express.Router();

// Aplicar middlewares globais
router.use(authenticateToken);
router.use(paginationMiddleware);
router.use(hateoasMiddleware('notas-fiscais'));

// ===== ROTAS PRINCIPAIS DE NOTAS FISCAIS =====

// Listar notas fiscais com paginação, busca e filtros
router.get('/', 
  commonValidations.pagination,
  NotasFiscaisController.listarNotasFiscais
);

// ===== ROTAS ESPECÍFICAS (DEVEM VIR ANTES DE /:id) =====

// GET /api/notas-fiscais/modelo - Baixar modelo de planilha para importação
router.get('/modelo',
  checkScreenPermission('notas-fiscais', 'criar'),
  NotaFiscalImportController.baixarModelo
);

// Buscar quantidades já lançadas para um pedido de compra
router.get('/quantidades-lancadas/:pedido_compra_id',
  NotasFiscaisController.buscarQuantidadesLancadas
);

// Download do arquivo da nota fiscal (deve vir antes de /:id para não conflitar)
const NotaFiscalDownloadController = require('../../controllers/notas-fiscais/NotaFiscalDownloadController');
router.get('/:id/download',
  commonValidations.id,
  NotaFiscalDownloadController.downloadArquivo
);

// Buscar nota fiscal por ID (deve vir por último, pois captura qualquer string)
router.get('/:id', 
  commonValidations.id,
  NotasFiscaisController.buscarNotaFiscalPorId
);

// Criar nota fiscal
router.post('/', 
  checkScreenPermission('notas-fiscais', 'criar'),
  uploadNotaFiscal,
  handleUploadError,
  parseFormData,
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'notas-fiscais'),
  notaFiscalValidations.create,
  NotasFiscaisController.criarNotaFiscal
);

// Atualizar nota fiscal
router.put('/:id', 
  checkScreenPermission('notas-fiscais', 'editar'),
  auditMiddleware(AUDIT_ACTIONS.UPDATE, 'notas-fiscais'),
  commonValidations.id,
  notaFiscalValidations.update,
  NotasFiscaisController.atualizarNotaFiscal
);

// Excluir nota fiscal
router.delete('/:id', 
  checkScreenPermission('notas-fiscais', 'excluir'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'notas-fiscais'),
  commonValidations.id,
  NotasFiscaisController.excluirNotaFiscal
);

// ===== ROTAS DE IMPORTAÇÃO =====

// POST /api/notas-fiscais/importar - Importar notas fiscais via Excel
router.post('/importar',
  checkScreenPermission('notas-fiscais', 'criar'),
  upload.single('file'),
  NotaFiscalImportController.importar
);

// ===== ROTAS DE RECÁLCULO DE MÉDIAS =====

// POST /api/notas-fiscais/recalcular-medias - Recalcular médias ponderadas desde o início
router.post('/recalcular-medias',
  checkScreenPermission('notas-fiscais', 'editar'),
  NotasFiscaisController.recalcularMediasPonderadas
);

// POST /api/notas-fiscais/recalcular-media-produto - Recalcular média de um produto específico
router.post('/recalcular-media-produto',
  checkScreenPermission('notas-fiscais', 'editar'),
  NotasFiscaisController.recalcularMediaProduto
);

module.exports = router;


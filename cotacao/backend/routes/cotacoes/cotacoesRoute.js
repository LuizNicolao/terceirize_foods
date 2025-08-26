/**
 * Rotas de Cotações
 * Implementa padrões RESTful com HATEOAS, paginação e validação
 */

const express = require('express');
const router = express.Router();
const CotacoesController = require('../../controllers/cotacoes/CotacoesController');
const { AnexosController, upload } = require('../../controllers/cotacoes/AnexosController');
const { authenticateToken, checkPermission } = require('../../middleware/auth');
const { 
  cotacoesValidation, 
  cotacaoValidation, 
  createCotacaoValidation, 
  updateCotacaoValidation, 
  analiseCotacaoValidation 
} = require('./cotacoesValidator');

// Rotas básicas de cotações
router.get('/', authenticateToken, checkPermission('visualizar'), cotacoesValidation, CotacoesController.getCotacoes);

// Rota para buscar compradores (apenas para administradores) - DEVE VIR ANTES das rotas com :id
router.get('/compradores', authenticateToken, checkPermission('visualizar'), CotacoesController.getCompradores);

// Rotas de estatísticas
router.get('/stats/overview', authenticateToken, checkPermission('visualizar'), CotacoesController.getStatsOverview);

// Rotas de exportação
router.get('/export/xlsx', authenticateToken, checkPermission('visualizar'), CotacoesController.exportXLSX);
router.get('/export/pdf', authenticateToken, checkPermission('visualizar'), CotacoesController.exportPDF);

// Rotas com parâmetros (DEVEM VIR DEPOIS das rotas específicas)
router.get('/:id', authenticateToken, checkPermission('visualizar'), cotacaoValidation, CotacoesController.getCotacao);
router.post('/', authenticateToken, checkPermission('criar'), createCotacaoValidation, CotacoesController.createCotacao);
router.put('/:id', authenticateToken, checkPermission('editar'), cotacaoValidation, updateCotacaoValidation, CotacoesController.updateCotacao);
router.delete('/:id', authenticateToken, checkPermission('excluir'), cotacaoValidation, CotacoesController.deleteCotacao);

// Rotas de anexos
router.get('/:id/anexos', authenticateToken, checkPermission('visualizar'), cotacaoValidation, AnexosController.getAnexos);
router.post('/:id/anexos', authenticateToken, checkPermission('editar'), cotacaoValidation, upload.single('anexo'), AnexosController.uploadAnexo);
router.get('/:id/anexos/:anexoId/download', authenticateToken, checkPermission('visualizar'), cotacaoValidation, AnexosController.downloadAnexo);
router.delete('/:id/anexos/:anexoId', authenticateToken, checkPermission('editar'), cotacaoValidation, AnexosController.deleteAnexo);

// Rotas de validação de anexos
router.get('/:id/validacao-anexos', authenticateToken, checkPermission('visualizar'), cotacaoValidation, AnexosController.getValidacaoAnexos);
router.post('/:id/validar-anexos', authenticateToken, checkPermission('editar'), cotacaoValidation, AnexosController.validarAnexos);

// Rotas específicas
router.post('/:id/enviar-supervisor', authenticateToken, checkPermission('editar'), CotacoesController.sendToSupervisor);
router.post('/:id/analisar', authenticateToken, checkPermission('editar'), CotacoesController.analisarCotacao);

// Rotas de upload e importação
router.post('/:id/upload', authenticateToken, checkPermission('editar'), CotacoesController.uploadFile);
router.post('/:id/importar-produtos', authenticateToken, checkPermission('editar'), CotacoesController.importarProdutos);

module.exports = router;

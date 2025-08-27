/**
 * Rotas de Auditoria
 * Implementa endpoints para visualização e exportação de logs de auditoria
 */

const express = require('express');
const router = express.Router();
const AuditoriaListController = require('../controllers/auditoria/AuditoriaListController');
const AuditoriaExportController = require('../controllers/auditoria/AuditoriaExportController');
const { authenticateToken, checkPermission } = require('../middleware/auth');

// Rotas de listagem
router.get('/', authenticateToken, checkPermission('visualizar'), AuditoriaListController.listarLogs);
router.get('/stats', authenticateToken, checkPermission('visualizar'), AuditoriaListController.buscarEstatisticas);

// Rotas de exportação
router.get('/export/xlsx', authenticateToken, checkPermission('visualizar'), AuditoriaExportController.exportarXLSX);
router.get('/export/pdf', authenticateToken, checkPermission('visualizar'), AuditoriaExportController.exportarPDF);

module.exports = router;

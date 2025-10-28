const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middleware/auth');
const { checkScreenPermission } = require('../../middleware/permissions');
const ConsultaStatusController = require('../../controllers/consulta-status-necessidade');

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

// Middleware de permissão para a tela
router.use(checkScreenPermission('consulta_status_necessidade'));

/**
 * @route GET /api/consulta-status-necessidade
 * @desc Listar status das necessidades com filtros e paginação
 * @access Private
 */
router.get('/', ConsultaStatusController.listarStatusNecessidades);

/**
 * @route GET /api/consulta-status-necessidade/estatisticas
 * @desc Obter estatísticas gerais das necessidades
 * @access Private
 */
router.get('/estatisticas', ConsultaStatusController.obterEstatisticas);

/**
 * @route GET /api/consulta-status-necessidade/exportar/xlsx
 * @desc Exportar dados para XLSX
 * @access Private
 */
router.get('/exportar/xlsx', ConsultaStatusController.exportarXLSX);

/**
 * @route GET /api/consulta-status-necessidade/exportar/pdf
 * @desc Exportar dados para PDF
 * @access Private
 */
router.get('/exportar/pdf', ConsultaStatusController.exportarPDF);

module.exports = router;

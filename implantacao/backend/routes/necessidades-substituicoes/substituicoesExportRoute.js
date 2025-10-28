const express = require('express');
const router = express.Router();
const SubstituicoesExportController = require('../../controllers/necessidades-substituicoes/SubstituicoesExportController');
const { authenticateToken } = require('../../middleware/auth');
const { canView } = require('../../middleware/permissoes');

/**
 * Rotas para exportação de substituições
 */

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

// Middleware de permissão para visualização
router.use(canView);

/**
 * @route POST /necessidades-substituicoes/exportar/pdf
 * @desc Exportar substituições para PDF
 * @access Private
 */
router.post('/pdf', SubstituicoesExportController.exportarPDF);

/**
 * @route POST /necessidades-substituicoes/exportar/xlsx
 * @desc Exportar substituições para XLSX
 * @access Private
 */
router.post('/xlsx', SubstituicoesExportController.exportarXLSX);

module.exports = router;

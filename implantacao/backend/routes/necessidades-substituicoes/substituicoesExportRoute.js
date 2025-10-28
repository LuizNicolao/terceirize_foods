const express = require('express');
const router = express.Router();
const SubstituicoesExportController = require('../../controllers/necessidades-substituicoes/SubstituicoesExportController');
const { authenticateToken } = require('../../middleware/auth');

// Middleware para verificar se usuário tem permissão para visualizar
const canView = (req, res, next) => {
  // TEMPORÁRIO: Permitir acesso para teste
  next();
};

/**
 * Rotas para exportação de substituições
 */

// POST /necessidades-substituicoes/exportar/pdf - Exportar para PDF
router.post('/pdf', authenticateToken, canView, SubstituicoesExportController.exportarPDF);

// POST /necessidades-substituicoes/exportar/xlsx - Exportar para XLSX
router.post('/xlsx', authenticateToken, canView, SubstituicoesExportController.exportarXLSX);

module.exports = router;

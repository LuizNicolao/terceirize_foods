const express = require('express');
const router = express.Router();
const AuditoriaController = require('../../controllers/auditoria/AuditoriaController');
const { authenticateToken, checkScreenPermission } = require('../../middleware/auth');

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

// Listar logs de auditoria
router.get('/', 
  checkScreenPermission('auditoria', 'visualizar'),
  AuditoriaController.listarLogsAuditoria
);

// Exportar logs para XLSX
router.get('/export/xlsx',
  checkScreenPermission('auditoria', 'visualizar'),
  AuditoriaController.exportarXLSX
);

// Exportar logs para PDF
router.get('/export/pdf',
  checkScreenPermission('auditoria', 'visualizar'),
  AuditoriaController.exportarPDF
);

// Registrar log de auditoria (usado internamente)
router.post('/',
  AuditoriaController.registrarLog
);

module.exports = router;

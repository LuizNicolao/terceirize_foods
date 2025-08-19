const express = require('express');
const { authenticateToken, checkPermission } = require('../middleware/auth');
const { hateoasMiddleware } = require('../middleware/hateoas');
const { paginationMiddleware } = require('../middleware/pagination');
const AuditoriaController = require('../controllers/auditoria');

const router = express.Router();

// ===== ROTAS DE TESTE (SEM AUTENTICAÇÃO) =====

// Rota sem autenticação para teste
router.get('/public-test', (req, res) => {
  res.json({ 
    success: true,
    message: 'Rota pública funcionando',
    timestamp: new Date().toISOString()
  });
});

// Aplicar autenticação em todas as outras rotas
router.use(authenticateToken);

// Aplicar middleware de paginação
router.use(paginationMiddleware);

// ===== ROTAS DE TESTE (COM AUTENTICAÇÃO) =====

// Rota simples para testar se a autenticação está funcionando
router.get('/ping', (req, res) => {
  res.json({ 
    success: true,
    message: 'Ping funcionando',
    user: req.user,
    headers: {
      authorization: req.headers.authorization ? 'presente' : 'ausente'
    }
  });
});

// Teste de conectividade da auditoria
router.get('/test', AuditoriaController.testarConectividade);

// Teste da função getAuditLogs
router.get('/test-function', AuditoriaController.testarGetAuditLogs);

// ===== ROTAS PRINCIPAIS DE AUDITORIA =====

// Listar logs de auditoria com filtros
router.get('/', 
  checkPermission('visualizar'),
  AuditoriaController.listarLogs,
  hateoasMiddleware
);

// Estatísticas de auditoria (apenas administradores)
router.get('/estatisticas', 
  checkPermission('visualizar'),
  AuditoriaController.buscarEstatisticas,
  hateoasMiddleware
);

// ===== ROTAS DE EXPORTAÇÃO =====

// Exportar logs de auditoria para XLSX
router.get('/export/xlsx', 
  checkPermission('visualizar'),
  AuditoriaController.exportarXLSX
);

// Exportar logs de auditoria para PDF
router.get('/export/pdf', 
  checkPermission('visualizar'),
  AuditoriaController.exportarPDF
);

module.exports = router; 
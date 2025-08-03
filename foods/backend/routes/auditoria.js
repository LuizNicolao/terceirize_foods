const express = require('express');
const { authenticateToken, checkPermission } = require('../middleware/auth');
const { hateoasMiddleware } = require('../middleware/hateoas');
const auditoriaController = require('../controllers/auditoriaController');

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
router.get('/test', auditoriaController.testarConectividade);

// Teste da função getAuditLogs
router.get('/test-function', auditoriaController.testarFuncao);

// ===== ROTAS PRINCIPAIS DE AUDITORIA =====

// Listar logs de auditoria com filtros
router.get('/', 
  checkPermission('visualizar'),
  auditoriaController.listarLogs,
  hateoasMiddleware
);

// Buscar logs de auditoria por usuário específico
router.get('/usuario/:usuarioId', 
  checkPermission('visualizar'),
  auditoriaController.buscarLogsPorUsuario,
  hateoasMiddleware
);

// Buscar logs de auditoria por recurso específico
router.get('/recurso/:recurso', 
  checkPermission('visualizar'),
  auditoriaController.buscarLogsPorRecurso,
  hateoasMiddleware
);

// Buscar logs de auditoria por ação específica
router.get('/acao/:acao', 
  checkPermission('visualizar'),
  auditoriaController.buscarLogsPorAcao,
  hateoasMiddleware
);

// Estatísticas de auditoria (apenas administradores)
router.get('/estatisticas', 
  checkPermission('visualizar'),
  auditoriaController.obterEstatisticas,
  hateoasMiddleware
);

// ===== ROTAS DE EXPORTAÇÃO =====

// Exportar logs de auditoria para XLSX
router.get('/export/xlsx', 
  checkPermission('visualizar'),
  auditoriaController.exportarXLSX
);

// Exportar logs de auditoria para PDF
router.get('/export/pdf', 
  checkPermission('visualizar'),
  auditoriaController.exportarPDF
);

module.exports = router; 
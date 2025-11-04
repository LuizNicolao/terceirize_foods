/**
 * Rotas de Formas de Pagamento
 * Implementa padrões RESTful com HATEOAS, paginação e validação
 */

const express = require('express');
const { authenticateToken, checkScreenPermission } = require('../../middleware/auth');
const { 
  formasPagamentoValidations, 
  commonValidations,
  handleValidationErrors
} = require('./formasPagamentoValidator');
const { paginationMiddleware } = require('../../middleware/pagination');
const { hateoasMiddleware } = require('../../middleware/hateoas');
const { auditMiddleware, auditChangesMiddleware, AUDIT_ACTIONS } = require('../../utils/audit');
const FormasPagamentoController = require('../../controllers/formas-pagamento');
const FormasPagamentoExportController = require('../../controllers/formas-pagamento/FormasPagamentoExportController');

const router = express.Router();

// Aplicar middlewares globais
router.use(authenticateToken);
router.use(paginationMiddleware);
router.use(hateoasMiddleware('formas-pagamento'));

// ========== ROTAS PRINCIPAIS ==========

// GET /api/formas-pagamento - Listar todas as formas de pagamento
router.get('/',
  checkScreenPermission('formas-pagamento', 'visualizar'),
  commonValidations.search,
  commonValidations.pagination,
  FormasPagamentoController.listarFormasPagamento
);

// GET /api/formas-pagamento/ativas - Buscar formas de pagamento ativas (para selects)
router.get('/ativas',
  checkScreenPermission('formas-pagamento', 'visualizar'),
  FormasPagamentoController.buscarFormasPagamentoAtivas
);

// ===== ROTAS DE EXPORTAÇÃO (DEVEM VIR ANTES DE /:id) =====

// GET /api/formas-pagamento/export/xlsx - Exportar para XLSX
router.get('/export/xlsx',
  checkScreenPermission('formas-pagamento', 'visualizar'),
  FormasPagamentoExportController.exportarXLSX
);

// GET /api/formas-pagamento/export/pdf - Exportar para PDF
router.get('/export/pdf',
  checkScreenPermission('formas-pagamento', 'visualizar'),
  FormasPagamentoExportController.exportarPDF
);

// GET /api/formas-pagamento/:id - Buscar forma de pagamento por ID
router.get('/:id',
  checkScreenPermission('formas-pagamento', 'visualizar'),
  commonValidations.id,
  FormasPagamentoController.buscarFormaPagamentoPorId
);

// POST /api/formas-pagamento - Criar nova forma de pagamento
router.post('/',
  checkScreenPermission('formas-pagamento', 'criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'formas_pagamento'),
  formasPagamentoValidations.create,
  FormasPagamentoController.criarFormaPagamento
);

// PUT /api/formas-pagamento/:id - Atualizar forma de pagamento
router.put('/:id',
  checkScreenPermission('formas-pagamento', 'editar'),
  auditChangesMiddleware(AUDIT_ACTIONS.UPDATE, 'formas_pagamento'),
  formasPagamentoValidations.update,
  FormasPagamentoController.atualizarFormaPagamento
);

// DELETE /api/formas-pagamento/:id - Excluir forma de pagamento
router.delete('/:id',
  checkScreenPermission('formas-pagamento', 'excluir'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'formas_pagamento'),
  commonValidations.id,
  FormasPagamentoController.excluirFormaPagamento
);

module.exports = router;


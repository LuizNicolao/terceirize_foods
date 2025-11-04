/**
 * Rotas de Prazos de Pagamento
 * Implementa padrões RESTful com HATEOAS, paginação e validação
 */

const express = require('express');
const { authenticateToken, checkScreenPermission } = require('../../middleware/auth');
const { 
  prazosPagamentoValidations, 
  commonValidations,
  handleValidationErrors
} = require('./prazosPagamentoValidator');
const { paginationMiddleware } = require('../../middleware/pagination');
const { hateoasMiddleware } = require('../../middleware/hateoas');
const { auditMiddleware, auditChangesMiddleware, AUDIT_ACTIONS } = require('../../utils/audit');
const PrazosPagamentoController = require('../../controllers/prazos-pagamento');
const PrazosPagamentoExportController = require('../../controllers/prazos-pagamento/PrazosPagamentoExportController');

const router = express.Router();

// Aplicar middlewares globais
router.use(authenticateToken);
router.use(paginationMiddleware);
router.use(hateoasMiddleware('prazos-pagamento'));

// ========== ROTAS PRINCIPAIS ==========

// GET /api/prazos-pagamento - Listar todos os prazos de pagamento
router.get('/',
  checkScreenPermission('prazos_pagamento', 'visualizar'),
  commonValidations.search,
  commonValidations.pagination,
  PrazosPagamentoController.listarPrazosPagamento
);

// GET /api/prazos-pagamento/ativas - Buscar prazos de pagamento ativos (para selects)
router.get('/ativas',
  checkScreenPermission('prazos_pagamento', 'visualizar'),
  PrazosPagamentoController.buscarPrazosPagamentoAtivos
);

// ===== ROTAS DE EXPORTAÇÃO (DEVEM VIR ANTES DE /:id) =====

// GET /api/prazos-pagamento/export/xlsx - Exportar para XLSX
router.get('/export/xlsx',
  checkScreenPermission('prazos_pagamento', 'visualizar'),
  PrazosPagamentoExportController.exportarXLSX
);

// GET /api/prazos-pagamento/export/pdf - Exportar para PDF
router.get('/export/pdf',
  checkScreenPermission('prazos_pagamento', 'visualizar'),
  PrazosPagamentoExportController.exportarPDF
);

// GET /api/prazos-pagamento/:id - Buscar prazo de pagamento por ID
router.get('/:id',
  checkScreenPermission('prazos_pagamento', 'visualizar'),
  commonValidations.id,
  PrazosPagamentoController.buscarPrazoPagamentoPorId
);

// POST /api/prazos-pagamento - Criar novo prazo de pagamento
router.post('/',
  checkScreenPermission('prazos_pagamento', 'criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'prazos_pagamento'),
  prazosPagamentoValidations.create,
  PrazosPagamentoController.criarPrazoPagamento
);

// PUT /api/prazos-pagamento/:id - Atualizar prazo de pagamento
router.put('/:id',
  checkScreenPermission('prazos_pagamento', 'editar'),
  auditChangesMiddleware(AUDIT_ACTIONS.UPDATE, 'prazos_pagamento'),
  prazosPagamentoValidations.update,
  PrazosPagamentoController.atualizarPrazoPagamento
);

// DELETE /api/prazos-pagamento/:id - Excluir prazo de pagamento
router.delete('/:id',
  checkScreenPermission('prazos_pagamento', 'excluir'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'prazos_pagamento'),
  commonValidations.id,
  PrazosPagamentoController.excluirPrazoPagamento
);

module.exports = router;


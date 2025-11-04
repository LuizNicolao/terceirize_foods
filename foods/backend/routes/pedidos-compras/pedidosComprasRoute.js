/**
 * Rotas de Pedidos de Compras
 * Implementa padrões RESTful com HATEOAS, paginação e validação
 */

const express = require('express');
const { authenticateToken, checkScreenPermission } = require('../../middleware/auth');
const { 
  pedidosComprasValidations, 
  commonValidations,
  handleValidationErrors
} = require('./pedidosComprasValidator');
const { paginationMiddleware } = require('../../middleware/pagination');
const { hateoasMiddleware } = require('../../middleware/hateoas');
const { auditMiddleware, auditChangesMiddleware, AUDIT_ACTIONS } = require('../../utils/audit');
const PedidosComprasController = require('../../controllers/pedidos-compras');
const PedidosComprasExportController = require('../../controllers/pedidos-compras/PedidosComprasExportController');

const router = express.Router();

// Aplicar middlewares globais
router.use(authenticateToken);
router.use(paginationMiddleware);
router.use(hateoasMiddleware('pedidos-compras'));

// ========== ROTAS PRINCIPAIS ==========

// GET /api/pedidos-compras - Listar todos os pedidos de compras
router.get('/',
  checkScreenPermission('pedidos-compras', 'visualizar'),
  commonValidations.search,
  commonValidations.pagination,
  PedidosComprasController.listarPedidosCompras
);

// GET /api/pedidos-compras/solicitacoes-disponiveis - Buscar solicitações disponíveis (para selects)
router.get('/solicitacoes-disponiveis',
  checkScreenPermission('pedidos-compras', 'visualizar'),
  PedidosComprasController.buscarSolicitacoesDisponiveis
);

// GET /api/pedidos-compras/itens-solicitacao/:id - Buscar itens da solicitação com saldo disponível
router.get('/itens-solicitacao/:id',
  checkScreenPermission('pedidos-compras', 'visualizar'),
  commonValidations.id,
  PedidosComprasController.buscarItensSolicitacao
);

// GET /api/pedidos-compras/dados-filial/:id - Buscar dados completos da filial
router.get('/dados-filial/:id',
  checkScreenPermission('pedidos-compras', 'visualizar'),
  commonValidations.id,
  PedidosComprasController.buscarDadosFilial
);

// ===== ROTAS DE EXPORTAÇÃO (DEVEM VIR ANTES DE /:id) =====

// GET /api/pedidos-compras/export/xlsx - Exportar para XLSX
router.get('/export/xlsx',
  checkScreenPermission('pedidos-compras', 'visualizar'),
  PedidosComprasExportController.exportarXLSX
);

// GET /api/pedidos-compras/export/pdf - Exportar para PDF
router.get('/export/pdf',
  checkScreenPermission('pedidos-compras', 'visualizar'),
  PedidosComprasExportController.exportarPDF
);

// GET /api/pedidos-compras/:id - Buscar pedido de compras por ID
router.get('/:id',
  checkScreenPermission('pedidos-compras', 'visualizar'),
  commonValidations.id,
  PedidosComprasController.buscarPedidoComprasPorId
);

// POST /api/pedidos-compras - Criar novo pedido de compras
router.post('/',
  checkScreenPermission('pedidos-compras', 'criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'pedidos_compras'),
  pedidosComprasValidations.create,
  PedidosComprasController.criarPedidoCompras
);

// PUT /api/pedidos-compras/:id - Atualizar pedido de compras
router.put('/:id',
  checkScreenPermission('pedidos-compras', 'editar'),
  auditChangesMiddleware(AUDIT_ACTIONS.UPDATE, 'pedidos_compras'),
  pedidosComprasValidations.update,
  PedidosComprasController.atualizarPedidoCompras
);

// DELETE /api/pedidos-compras/:id - Excluir pedido de compras
router.delete('/:id',
  checkScreenPermission('pedidos-compras', 'excluir'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'pedidos_compras'),
  commonValidations.id,
  PedidosComprasController.excluirPedidoCompras
);

// ========== ROTAS DE AÇÕES EM LOTE ==========

// POST /api/pedidos-compras/acoes-em-lote/aprovar - Aprovar múltiplos pedidos
router.post('/acoes-em-lote/aprovar',
  checkScreenPermission('pedidos-compras', 'editar'),
  auditMiddleware(AUDIT_ACTIONS.UPDATE, 'pedidos_compras'),
  PedidosComprasController.aprovarPedidosEmLote
);

// POST /api/pedidos-compras/acoes-em-lote/reabrir - Reabrir múltiplos pedidos
router.post('/acoes-em-lote/reabrir',
  checkScreenPermission('pedidos-compras', 'editar'),
  auditMiddleware(AUDIT_ACTIONS.UPDATE, 'pedidos_compras'),
  PedidosComprasController.reabrirPedidosEmLote
);

module.exports = router;


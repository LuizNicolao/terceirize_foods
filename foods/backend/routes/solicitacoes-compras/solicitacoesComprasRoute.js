/**
 * Rotas de Solicitações de Compras
 * Implementa padrões RESTful com HATEOAS, paginação e validação
 */

const express = require('express');
const { body } = require('express-validator');
const { authenticateToken, checkScreenPermission } = require('../../middleware/auth');
const { 
  solicitacoesComprasValidations, 
  commonValidations,
  handleValidationErrors
} = require('./solicitacoesComprasValidator');
const { paginationMiddleware } = require('../../middleware/pagination');
const { hateoasMiddleware } = require('../../middleware/hateoas');
const { auditMiddleware, auditChangesMiddleware, AUDIT_ACTIONS } = require('../../utils/audit');
const SolicitacoesComprasController = require('../../controllers/solicitacoes-compras');

const router = express.Router();

// Aplicar middlewares globais
router.use(authenticateToken);
router.use(paginationMiddleware);
router.use(hateoasMiddleware('solicitacoes-compras'));

// ========== ROTAS PRINCIPAIS ==========

// GET /api/solicitacoes-compras - Listar todas as solicitações
router.get('/',
  checkScreenPermission('solicitacoes_compras', 'visualizar'),
  commonValidations.search,
  commonValidations.pagination,
  SolicitacoesComprasController.listarSolicitacoes
);

// GET /api/solicitacoes-compras/:id/pdf - Gerar PDF da solicitação (deve vir antes de /:id)
router.get('/:id/pdf',
  checkScreenPermission('solicitacoes_compras', 'visualizar'),
  commonValidations.id,
  SolicitacoesComprasController.gerarPDF
);

// GET /api/solicitacoes-compras/:id - Buscar solicitação por ID
router.get('/:id',
  checkScreenPermission('solicitacoes_compras', 'visualizar'),
  commonValidations.id,
  SolicitacoesComprasController.buscarSolicitacaoPorId
);

// POST /api/solicitacoes-compras - Criar nova solicitação
router.post('/',
  checkScreenPermission('solicitacoes_compras', 'criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'solicitacoes_compras'),
  solicitacoesComprasValidations.create,
  SolicitacoesComprasController.criarSolicitacao
);

// PUT /api/solicitacoes-compras/:id - Atualizar solicitação
router.put('/:id',
  checkScreenPermission('solicitacoes_compras', 'editar'),
  auditChangesMiddleware(AUDIT_ACTIONS.UPDATE, 'solicitacoes_compras'),
  solicitacoesComprasValidations.update,
  SolicitacoesComprasController.atualizarSolicitacao
);

// DELETE /api/solicitacoes-compras/:id - Excluir solicitação
router.delete('/:id',
  checkScreenPermission('solicitacoes_compras', 'excluir'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'solicitacoes_compras'),
  commonValidations.id,
  SolicitacoesComprasController.excluirSolicitacao
);

// ========== ROTAS DE STATUS ==========

// POST /api/solicitacoes-compras/:id/recalcular-status - Recalcular status
router.post('/:id/recalcular-status',
  checkScreenPermission('solicitacoes_compras', 'editar'),
  commonValidations.id,
  SolicitacoesComprasController.recalcularStatus
);

// POST /api/solicitacoes-compras/recalcular-todos-status - Recalcular todos os status
router.post('/recalcular-todos-status',
  checkScreenPermission('solicitacoes_compras', 'editar'),
  SolicitacoesComprasController.recalcularTodosStatus
);

// ========== ROTAS DE INTEGRAÇÃO ==========

// POST /api/solicitacoes-compras/buscar-semana-abastecimento - Buscar semana de abastecimento
router.post('/buscar-semana-abastecimento',
  checkScreenPermission('solicitacoes_compras', 'visualizar'),
  body('data_entrega')
    .isISO8601()
    .withMessage('Data de entrega deve ser uma data válida (formato ISO)')
    .toDate(),
  handleValidationErrors,
  SolicitacoesComprasController.buscarSemanaAbastecimento
);

module.exports = router;


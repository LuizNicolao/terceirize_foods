/**
 * Rotas de Relatório de Inspeção de Recebimento (RIR)
 * Implementa padrões RESTful com HATEOAS, paginação e validação
 */

const express = require('express');
const { query } = require('express-validator');
const { authenticateToken, checkPermission } = require('../../middleware/auth');
const { 
  rirValidations, 
  commonValidations,
  handleValidationErrors
} = require('./relatorioInspecaoValidator');
const { paginationMiddleware } = require('../../middleware/pagination');
const { hateoasMiddleware } = require('../../middleware/hateoas');
const { auditMiddleware, auditChangesMiddleware, AUDIT_ACTIONS } = require('../../utils/audit');
const RIRController = require('../../controllers/relatorio-inspecao');

const router = express.Router();

// Aplicar middlewares globais
router.use(authenticateToken);
router.use(paginationMiddleware);
router.use(hateoasMiddleware('relatorio-inspecao'));

// ========== ROTAS PRINCIPAIS ==========

// GET /api/relatorio-inspecao - Listar todos os RIRs
router.get('/',
  checkPermission('visualizar'),
  commonValidations.search,
  commonValidations.pagination,
  RIRController.listarRIRs
);

// ========== ROTAS DE INTEGRAÇÃO (ANTES DE /:id) ==========

// GET /api/relatorio-inspecao/buscar-produtos-pedido?id={pedido_id}
router.get('/buscar-produtos-pedido',
  checkPermission('visualizar'),
  query('id')
    .isInt({ min: 1 })
    .withMessage('ID do pedido deve ser um número inteiro positivo'),
  handleValidationErrors,
  RIRController.buscarProdutosPedido
);

// GET /api/relatorio-inspecao/buscar-nqa-grupo?grupo_id={grupo_id}
router.get('/buscar-nqa-grupo',
  checkPermission('visualizar'),
  query('grupo_id')
    .isInt({ min: 1 })
    .withMessage('grupo_id deve ser um número inteiro positivo'),
  handleValidationErrors,
  RIRController.buscarNQAGrupo
);

// GET /api/relatorio-inspecao/buscar-plano-lote?nqa_id={nqa_id}&tamanho_lote={tamanho}
router.get('/buscar-plano-lote',
  checkPermission('visualizar'),
  query('nqa_id')
    .isInt({ min: 1 })
    .withMessage('nqa_id deve ser um número inteiro positivo'),
  query('tamanho_lote')
    .isInt({ min: 1 })
    .withMessage('tamanho_lote deve ser um número inteiro positivo'),
  handleValidationErrors,
  RIRController.buscarPlanoPorLote
);

// GET /api/relatorio-inspecao/pedidos-aprovados
router.get('/pedidos-aprovados',
  checkPermission('visualizar'),
  RIRController.buscarPedidosAprovados
);

// GET /api/relatorio-inspecao/grupos
router.get('/grupos',
  checkPermission('visualizar'),
  RIRController.buscarGrupos
);

// GET /api/relatorio-inspecao/:id - Buscar RIR por ID (DEPOIS DAS ROTAS ESTÁTICAS)
router.get('/:id',
  checkPermission('visualizar'),
  commonValidations.id,
  RIRController.buscarRIRPorId
);

// POST /api/relatorio-inspecao - Criar novo RIR
router.post('/',
  checkPermission('criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'relatorio_inspecao'),
  rirValidations.create,
  RIRController.criarRIR
);

// PUT /api/relatorio-inspecao/:id - Atualizar RIR
router.put('/:id',
  checkPermission('editar'),
  auditChangesMiddleware(AUDIT_ACTIONS.UPDATE, 'relatorio_inspecao'),
  rirValidations.update,
  RIRController.atualizarRIR
);

// DELETE /api/relatorio-inspecao/:id - Excluir RIR
router.delete('/:id',
  checkPermission('excluir'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'relatorio_inspecao'),
  commonValidations.id,
  RIRController.excluirRIR
);

module.exports = router;


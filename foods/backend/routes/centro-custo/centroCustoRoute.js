/**
 * Rotas de Centro de Custo
 * Implementa padrões RESTful com HATEOAS, paginação e validação
 */

const express = require('express');
const { authenticateToken, checkPermission } = require('../../middleware/auth');
const { centroCustoValidations, commonValidations } = require('./centroCustoValidator');
const { paginationMiddleware } = require('../../middleware/pagination');
const { hateoasMiddleware } = require('../../middleware/hateoas');
const { auditMiddleware, auditChangesMiddleware, AUDIT_ACTIONS } = require('../../utils/audit');
const CentroCustoController = require('../../controllers/centro-custo');

const router = express.Router();

// Aplicar middlewares globais
router.use(authenticateToken);
router.use(paginationMiddleware);
router.use(hateoasMiddleware('centro_custo'));

// GET /api/centro-custo - Listar centros de custo com paginação e busca
router.get('/', 
  checkPermission('visualizar'),
  commonValidations.search,
  commonValidations.pagination,
  CentroCustoController.listarCentrosCusto
);

// GET /api/centro-custo/ativos - Buscar centros de custo ativos
router.get('/ativos',
  checkPermission('visualizar'),
  CentroCustoController.buscarCentrosCustoAtivos
);

// GET /api/centro-custo/estatisticas - Buscar estatísticas de centros de custo
router.get('/estatisticas',
  checkPermission('visualizar'),
  CentroCustoController.buscarEstatisticas
);

// GET /api/centro-custo/proximo-codigo - Obter próximo código disponível
router.get('/proximo-codigo',
  checkPermission('visualizar'),
  CentroCustoController.obterProximoCodigo
);

// GET /api/centro-custo/codigo/:codigo - Buscar centro de custo por código
router.get('/codigo/:codigo',
  checkPermission('visualizar'),
  CentroCustoController.buscarCentroCustoPorCodigo
);

// GET /api/centro-custo/filial/:filial_id - Buscar centros de custo por filial
router.get('/filial/:filial_id',
  checkPermission('visualizar'),
  CentroCustoController.buscarCentrosCustoPorFilial
);

// GET /api/centro-custo/:id - Buscar centro de custo por ID
router.get('/:id', 
  checkPermission('visualizar'),
  commonValidations.id,
  CentroCustoController.buscarCentroCustoPorId
);

// POST /api/centro-custo - Criar novo centro de custo
router.post('/', 
  checkPermission('criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'centro_custo'),
  centroCustoValidations.create,
  CentroCustoController.criarCentroCusto
);

// PUT /api/centro-custo/:id - Atualizar centro de custo
router.put('/:id', 
  checkPermission('editar'),
  auditChangesMiddleware(AUDIT_ACTIONS.UPDATE, 'centro_custo'),
  centroCustoValidations.update,
  CentroCustoController.atualizarCentroCusto
);

// DELETE /api/centro-custo/:id - Excluir centro de custo (soft delete)
router.delete('/:id', 
  checkPermission('excluir'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'centro_custo'),
  commonValidations.id,
  CentroCustoController.excluirCentroCusto
);

module.exports = router;


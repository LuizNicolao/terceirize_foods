/**
 * Rotas de Periodicidade
 * Implementa padrões RESTful com HATEOAS, paginação e validação
 */

const express = require('express');
const { authenticateToken, checkPermission } = require('../../middleware/auth');
const { paginationMiddleware } = require('../../middleware/pagination');
const { hateoasMiddleware } = require('../../middleware/hateoas');
const { auditMiddleware, AUDIT_ACTIONS } = require('../../utils/audit');
const { commonValidations, periodicidadeValidations } = require('./periodicidadeValidator');
const PeriodicidadeController = require('../../controllers/periodicidade');
const entregasRoute = require('./entregasRoute');

const router = express.Router();

// Aplicar middlewares globais
router.use(authenticateToken);
router.use(paginationMiddleware);
router.use(hateoasMiddleware('periodicidade'));


// =====================================================
// ROTAS PARA AGRUPAMENTOS DE PERIODICIDADE
// =====================================================

// GET /api/periodicidade/agrupamentos - Listar agrupamentos com filtros e paginação
router.get('/agrupamentos', 
  checkPermission('visualizar'),
  commonValidations.search,
  commonValidations.pagination,
  PeriodicidadeController.listarAgrupamentos
);

// POST /api/periodicidade/agrupamentos - Criar novo agrupamento de periodicidade
router.post('/agrupamentos', 
  checkPermission('criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'periodicidade'),
  periodicidadeValidations.criarAgrupamento,
  PeriodicidadeController.criarAgrupamento
);

// GET /api/periodicidade/agrupamentos/:id - Buscar agrupamento por ID
router.get('/agrupamentos/:id', 
  checkPermission('visualizar'),
  commonValidations.id,
  PeriodicidadeController.buscarAgrupamentoPorId
);

// PUT /api/periodicidade/agrupamentos/:id - Atualizar agrupamento
router.put('/agrupamentos/:id', 
  checkPermission('editar'),
  auditMiddleware(AUDIT_ACTIONS.UPDATE, 'periodicidade'),
  periodicidadeValidations.atualizarAgrupamento,
  PeriodicidadeController.atualizarAgrupamento
);

// DELETE /api/periodicidade/agrupamentos/:id - Excluir agrupamento (soft delete)
router.delete('/agrupamentos/:id', 
  checkPermission('excluir'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'periodicidade'),
  commonValidations.id,
  PeriodicidadeController.excluirAgrupamento
);

// POST /api/periodicidade/agrupamentos/:id/escolas - Vincular escolas ao agrupamento
router.post('/agrupamentos/:id/escolas', 
  checkPermission('editar'),
  auditMiddleware(AUDIT_ACTIONS.UPDATE, 'periodicidade'),
  commonValidations.id,
  PeriodicidadeController.vincularEscolas
);

// GET /api/periodicidade/agrupamentos/:id/escolas - Buscar escolas vinculadas ao agrupamento
router.get('/agrupamentos/:id/escolas', 
  checkPermission('visualizar'),
  commonValidations.id,
  PeriodicidadeController.buscarEscolasVinculadas
);

// GET /api/periodicidade/agrupamentos/:id/produtos - Buscar produtos vinculados ao agrupamento
router.get('/agrupamentos/:id/produtos', 
  checkPermission('visualizar'),
  commonValidations.id,
  PeriodicidadeController.buscarProdutosVinculados
);

// GET /api/periodicidade/agrupamentos/:id/historico - Buscar histórico de aplicações do agrupamento
router.get('/agrupamentos/:id/historico', 
  checkPermission('visualizar'),
  commonValidations.id,
  commonValidations.pagination,
  PeriodicidadeController.buscarHistoricoAplicacoes
);

// GET /api/periodicidade/tipos - Listar tipos de periodicidade
router.get('/tipos', 
  checkPermission('visualizar'),
  PeriodicidadeController.listarTipos
);

// GET /api/periodicidade/estatisticas - Buscar estatísticas dos agrupamentos
router.get('/estatisticas', 
  checkPermission('visualizar'),
  PeriodicidadeController.buscarEstatisticas
);

// GET /api/periodicidade/produtos/grupo/:grupoId - Buscar produtos por grupo para periodicidade
router.get('/produtos/grupo/:grupoId', 
  checkPermission('visualizar'),
  commonValidations.id,
  PeriodicidadeController.buscarProdutosPorGrupo
);

// GET /api/periodicidade/escolas/:escolaId/agrupamentos - Buscar agrupamentos vinculados a uma escola
router.get('/escolas/:escolaId/agrupamentos', 
  checkPermission('visualizar'),
  commonValidations.id,
  PeriodicidadeController.buscarAgrupamentosPorEscola
);

// GET /api/periodicidade/unidades-escolares/:unidadeEscolarId/agrupamentos - Buscar agrupamentos vinculados a uma unidade escolar
router.get('/unidades-escolares/:unidadeEscolarId/agrupamentos', 
  checkPermission('visualizar'),
  commonValidations.id,
  PeriodicidadeController.buscarAgrupamentosPorUnidade
);

// =====================================================
// ROTAS PARA ENTREGAS AGENDADAS
// =====================================================

// Usar as rotas de entregas
router.use('/', entregasRoute);

module.exports = router;

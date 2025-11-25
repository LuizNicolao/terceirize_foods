/**
 * Rotas de Almoxarifado
 * Implementa padrões RESTful com HATEOAS, paginação e validação
 */

const express = require('express');
const { authenticateToken, checkPermission } = require('../../middleware/auth');
const { almoxarifadoValidations, commonValidations } = require('./almoxarifadoValidator');
const { paginationMiddleware } = require('../../middleware/pagination');
const { hateoasMiddleware } = require('../../middleware/hateoas');
const { auditMiddleware, auditChangesMiddleware, AUDIT_ACTIONS } = require('../../utils/audit');
const AlmoxarifadoController = require('../../controllers/almoxarifado');

const router = express.Router();

// Aplicar middlewares globais
router.use(authenticateToken);
router.use(paginationMiddleware);
router.use(hateoasMiddleware('almoxarifado'));

// GET /api/almoxarifado - Listar almoxarifados com paginação e busca
router.get('/', 
  checkPermission('visualizar'),
  commonValidations.search,
  commonValidations.pagination,
  AlmoxarifadoController.listarAlmoxarifados
);

// GET /api/almoxarifado/ativos - Buscar almoxarifados ativos
router.get('/ativos',
  checkPermission('visualizar'),
  AlmoxarifadoController.buscarAlmoxarifadosAtivos
);

// GET /api/almoxarifado/estatisticas - Buscar estatísticas de almoxarifados
router.get('/estatisticas',
  checkPermission('visualizar'),
  AlmoxarifadoController.buscarEstatisticas
);

// GET /api/almoxarifado/proximo-codigo - Obter próximo código disponível
router.get('/proximo-codigo',
  checkPermission('visualizar'),
  AlmoxarifadoController.obterProximoCodigo
);

// GET /api/almoxarifado/codigo/:codigo - Buscar almoxarifado por código
router.get('/codigo/:codigo',
  checkPermission('visualizar'),
  AlmoxarifadoController.buscarAlmoxarifadoPorCodigo
);

// GET /api/almoxarifado/filial/:filial_id - Buscar almoxarifados por filial
router.get('/filial/:filial_id',
  checkPermission('visualizar'),
  AlmoxarifadoController.buscarAlmoxarifadosPorFilial
);

// GET /api/almoxarifado/centro-custo/:centro_custo_id - Buscar almoxarifados por centro de custo
router.get('/centro-custo/:centro_custo_id',
  checkPermission('visualizar'),
  AlmoxarifadoController.buscarAlmoxarifadosPorCentroCusto
);

// GET /api/almoxarifado/:id - Buscar almoxarifado por ID
router.get('/:id', 
  checkPermission('visualizar'),
  commonValidations.id,
  AlmoxarifadoController.buscarAlmoxarifadoPorId
);

// POST /api/almoxarifado - Criar novo almoxarifado
router.post('/', 
  checkPermission('criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'almoxarifado'),
  almoxarifadoValidations.create,
  AlmoxarifadoController.criarAlmoxarifado
);

// PUT /api/almoxarifado/:id - Atualizar almoxarifado
router.put('/:id', 
  checkPermission('editar'),
  auditChangesMiddleware(AUDIT_ACTIONS.UPDATE, 'almoxarifado'),
  almoxarifadoValidations.update,
  AlmoxarifadoController.atualizarAlmoxarifado
);

// DELETE /api/almoxarifado/:id - Excluir almoxarifado (soft delete)
router.delete('/:id', 
  checkPermission('excluir'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'almoxarifado'),
  commonValidations.id,
  AlmoxarifadoController.excluirAlmoxarifado
);

module.exports = router;


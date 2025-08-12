/**
 * Rotas de Unidades
 * Implementa padrões RESTful com HATEOAS, paginação e validação
 */

const express = require('express');
const { authenticateToken, checkPermission } = require('../../middleware/auth');
const { unidadeValidations, commonValidations } = require('./unidadeValidator');
const { paginationMiddleware } = require('../../middleware/pagination');
const { hateoasMiddleware } = require('../../middleware/hateoas');
const { auditMiddleware, AUDIT_ACTIONS } = require('../../utils/audit');
const UnidadesController = require('../../controllers/unidadesController');

const router = express.Router();

// Aplicar middlewares globais
router.use(authenticateToken);
router.use(paginationMiddleware);
router.use(hateoasMiddleware('unidades'));

// GET /api/unidades - Listar unidades com paginação e busca
router.get('/', 
  checkPermission('visualizar'),
  commonValidations.search,
  commonValidations.pagination,
  UnidadesController.listarUnidades
);

// GET /api/unidades/:id - Buscar unidade por ID
router.get('/:id', 
  checkPermission('visualizar'),
  commonValidations.id,
  UnidadesController.buscarUnidadePorId
);

// POST /api/unidades - Criar nova unidade
router.post('/', 
  checkPermission('criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'unidades'),
  unidadeValidations.create,
  UnidadesController.criarUnidade
);

// PUT /api/unidades/:id - Atualizar unidade
router.put('/:id', 
  checkPermission('editar'),
  auditMiddleware(AUDIT_ACTIONS.UPDATE, 'unidades'),
  unidadeValidations.update,
  UnidadesController.atualizarUnidade
);

// DELETE /api/unidades/:id - Excluir unidade (soft delete)
router.delete('/:id', 
  checkPermission('excluir'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'unidades'),
  commonValidations.id,
  UnidadesController.excluirUnidade
);

// GET /api/unidades/ativas/listar - Buscar unidades ativas
router.get('/ativas/listar', 
  checkPermission('visualizar'),
  UnidadesController.buscarUnidadesAtivas
);

// GET /api/unidades/tipo/:tipo - Buscar unidades por tipo
router.get('/tipo/:tipo', 
  checkPermission('visualizar'),
  UnidadesController.buscarUnidadesPorTipo
);

// GET /api/unidades/tipos/listar - Listar tipos de unidades
router.get('/tipos/listar', 
  checkPermission('visualizar'),
  UnidadesController.listarTiposUnidades
);

// GET /api/unidades/mais-utilizadas - Buscar unidades mais utilizadas
router.get('/mais-utilizadas', 
  checkPermission('visualizar'),
  UnidadesController.buscarUnidadesMaisUtilizadas
);

module.exports = router;

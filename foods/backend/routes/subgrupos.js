/**
 * Rotas de Subgrupos
 * Implementa padrões RESTful com HATEOAS, paginação e validação
 */

const express = require('express');
const { authenticateToken, checkPermission } = require('../middleware/auth');
const { subgrupoValidations, commonValidations } = require('../middleware/validation');
const { paginationMiddleware } = require('../middleware/pagination');
const { hateoasMiddleware } = require('../middleware/hateoas');
const { auditMiddleware, AUDIT_ACTIONS } = require('../utils/audit');
const SubgruposController = require('../controllers/subgruposController');

const router = express.Router();

// Aplicar middlewares globais
router.use(authenticateToken);
router.use(paginationMiddleware);
router.use(hateoasMiddleware('subgrupos'));

// GET /api/subgrupos - Listar subgrupos com paginação e busca
router.get('/', 
  checkPermission('visualizar'),
  commonValidations.search,
  commonValidations.pagination,
  SubgruposController.listarSubgrupos
);

// GET /api/subgrupos/:id - Buscar subgrupo por ID
router.get('/:id', 
  checkPermission('visualizar'),
  commonValidations.id,
  SubgruposController.buscarSubgrupoPorId
);

// POST /api/subgrupos - Criar novo subgrupo
router.post('/', 
  checkPermission('criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'subgrupos'),
  subgrupoValidations.create,
  SubgruposController.criarSubgrupo
);

// PUT /api/subgrupos/:id - Atualizar subgrupo
router.put('/:id', 
  checkPermission('editar'),
  auditMiddleware(AUDIT_ACTIONS.UPDATE, 'subgrupos'),
  subgrupoValidations.update,
  SubgruposController.atualizarSubgrupo
);

// DELETE /api/subgrupos/:id - Excluir subgrupo (soft delete)
router.delete('/:id', 
  checkPermission('excluir'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'subgrupos'),
  commonValidations.id,
  SubgruposController.excluirSubgrupo
);

// GET /api/subgrupos/ativos - Buscar subgrupos ativos
router.get('/ativos',
  checkPermission('visualizar'),
  SubgruposController.buscarAtivos
);

// GET /api/subgrupos/grupo/:grupo_id - Buscar subgrupos por grupo
router.get('/grupo/:grupo_id',
  checkPermission('visualizar'),
  commonValidations.id,
  SubgruposController.buscarPorGrupo
);

module.exports = router; 
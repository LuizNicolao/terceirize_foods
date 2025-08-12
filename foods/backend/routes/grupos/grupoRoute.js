/**
 * Rotas de Grupos
 * Implementa padrões RESTful com HATEOAS, paginação e validação
 */

const express = require('express');
const { authenticateToken, checkPermission } = require('../../middleware/auth');
const { grupoValidations, commonValidations } = require('./grupoValidator');
const { paginationMiddleware } = require('../../middleware/pagination');
const { hateoasMiddleware } = require('../../middleware/hateoas');
const { auditMiddleware, AUDIT_ACTIONS } = require('../../utils/audit');
const GruposController = require('../../controllers/gruposController');

const router = express.Router();

// Aplicar middlewares globais
router.use(authenticateToken);
router.use(paginationMiddleware);
router.use(hateoasMiddleware('grupos'));

// GET /api/grupos - Listar grupos com paginação e busca
router.get('/', 
  checkPermission('visualizar'),
  commonValidations.search,
  commonValidations.pagination,
  GruposController.listarGrupos
);

// GET /api/grupos/:id - Buscar grupo por ID
router.get('/:id', 
  checkPermission('visualizar'),
  commonValidations.id,
  GruposController.buscarGrupoPorId
);

// POST /api/grupos - Criar novo grupo
router.post('/', 
  checkPermission('criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'grupos'),
  grupoValidations.create,
  GruposController.criarGrupo
);

// PUT /api/grupos/:id - Atualizar grupo
router.put('/:id', 
  checkPermission('editar'),
  auditMiddleware(AUDIT_ACTIONS.UPDATE, 'grupos'),
  grupoValidations.update,
  GruposController.atualizarGrupo
);

// DELETE /api/grupos/:id - Excluir grupo (soft delete)
router.delete('/:id', 
  checkPermission('excluir'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'grupos'),
  commonValidations.id,
  GruposController.excluirGrupo
);

// GET /api/grupos/ativos - Buscar grupos ativos
router.get('/ativos',
  checkPermission('visualizar'),
  GruposController.buscarAtivos
);

// GET /api/grupos/:id/subgrupos - Buscar subgrupos de um grupo
router.get('/:id/subgrupos',
  checkPermission('visualizar'),
  commonValidations.id,
  GruposController.buscarSubgrupos
);

module.exports = router;

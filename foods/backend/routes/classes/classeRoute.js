/**
 * Rotas de Classes
 * Implementa padrões RESTful com HATEOAS, paginação e validação
 */

const express = require('express');
const { authenticateToken, checkPermission } = require('../../middleware/auth');
const { classeValidations, commonValidations } = require('./classeValidator');
const { paginationMiddleware } = require('../../middleware/pagination');
const { hateoasMiddleware } = require('../../middleware/hateoas');
const { auditMiddleware, AUDIT_ACTIONS } = require('../../utils/audit');
const ClassesController = require('../../controllers/classesController');

const router = express.Router();

// Aplicar middlewares globais
router.use(authenticateToken);
router.use(paginationMiddleware);
router.use(hateoasMiddleware('classes'));

// GET /api/classes - Listar classes com paginação e busca
router.get('/', 
  checkPermission('visualizar'),
  commonValidations.search,
  commonValidations.pagination,
  ClassesController.listarClasses
);

// GET /api/classes/ativas - Buscar classes ativas
router.get('/ativas',
  checkPermission('visualizar'),
  ClassesController.buscarAtivas
);

// GET /api/classes/subgrupo/:subgrupo_id - Buscar classes por subgrupo
router.get('/subgrupo/:subgrupo_id',
  checkPermission('visualizar'),
  commonValidations.id,
  ClassesController.buscarPorSubgrupo
);

// GET /api/classes/:id - Buscar classe por ID
router.get('/:id', 
  checkPermission('visualizar'),
  commonValidations.id,
  ClassesController.buscarClassePorId
);

// POST /api/classes - Criar nova classe
router.post('/', 
  checkPermission('criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'classes'),
  classeValidations.create,
  ClassesController.criarClasse
);

// PUT /api/classes/:id - Atualizar classe
router.put('/:id', 
  checkPermission('editar'),
  auditMiddleware(AUDIT_ACTIONS.UPDATE, 'classes'),
  classeValidations.update,
  ClassesController.atualizarClasse
);

// DELETE /api/classes/:id - Excluir classe (soft delete)
router.delete('/:id', 
  checkPermission('excluir'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'classes'),
  commonValidations.id,
  ClassesController.excluirClasse
);

module.exports = router;

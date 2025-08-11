/**
 * Rotas de Ajudantes
 * Implementa padrões RESTful com HATEOAS, paginação e validação
 */

const express = require('express');
const { authenticateToken, checkPermission } = require('../../middleware/auth');
const { ajudanteValidations, commonValidations } = require('./ajudanteValidator');
const { paginationMiddleware } = require('../../middleware/pagination');
const { hateoasMiddleware } = require('../../middleware/hateoas');
const { auditMiddleware, AUDIT_ACTIONS } = require('../../utils/audit');
const ajudantesController = require('../../controllers/ajudantesController');

const router = express.Router();

// Aplicar middlewares globais
router.use(authenticateToken);
router.use(paginationMiddleware);
router.use(hateoasMiddleware('ajudantes'));

// GET /api/ajudantes - Listar ajudantes com paginação e busca
router.get('/', 
  checkPermission('visualizar'),
  commonValidations.search,
  commonValidations.pagination,
  ajudantesController.listarAjudantes
);

// GET /api/ajudantes/:id - Buscar ajudante por ID
router.get('/:id', 
  checkPermission('visualizar'),
  commonValidations.id,
  ajudantesController.buscarAjudantePorId
);

// POST /api/ajudantes - Criar novo ajudante
router.post('/', 
  checkPermission('criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'ajudantes'),
  ajudanteValidations.create,
  ajudantesController.criarAjudante
);

// PUT /api/ajudantes/:id - Atualizar ajudante
router.put('/:id', 
  checkPermission('editar'),
  auditMiddleware(AUDIT_ACTIONS.UPDATE, 'ajudantes'),
  ajudanteValidations.update,
  ajudantesController.atualizarAjudante
);

// DELETE /api/ajudantes/:id - Excluir ajudante
router.delete('/:id', 
  checkPermission('excluir'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'ajudantes'),
  commonValidations.id,
  ajudantesController.excluirAjudante
);

module.exports = router;

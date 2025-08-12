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
const AjudantesController = require('../../controllers/ajudantesController');

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
  AjudantesController.listarAjudantes
);

// GET /api/ajudantes/:id - Buscar ajudante por ID
router.get('/:id', 
  checkPermission('visualizar'),
  commonValidations.id,
  AjudantesController.buscarAjudantePorId
);

// POST /api/ajudantes - Criar novo ajudante
router.post('/', 
  checkPermission('criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'ajudantes'),
  ajudanteValidations.create,
  AjudantesController.criarAjudante
);

// PUT /api/ajudantes/:id - Atualizar ajudante
router.put('/:id', 
  checkPermission('editar'),
  auditMiddleware(AUDIT_ACTIONS.UPDATE, 'ajudantes'),
  ajudanteValidations.update,
  AjudantesController.atualizarAjudante
);

// DELETE /api/ajudantes/:id - Excluir ajudante
router.delete('/:id', 
  checkPermission('excluir'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'ajudantes'),
  commonValidations.id,
  AjudantesController.excluirAjudante
);

// GET /api/ajudantes/ativos/listar - Buscar ajudantes ativos
router.get('/ativos/listar', 
  checkPermission('visualizar'),
  AjudantesController.buscarAjudantesAtivos
);

// GET /api/ajudantes/filial/:filialId - Buscar ajudantes por filial
router.get('/filial/:filialId', 
  checkPermission('visualizar'),
  AjudantesController.buscarAjudantesPorFilial
);

// GET /api/ajudantes/status/:status - Buscar ajudantes por status
router.get('/status/:status', 
  checkPermission('visualizar'),
  AjudantesController.buscarAjudantesPorStatus
);

// GET /api/ajudantes/status/listar - Listar status disponíveis
router.get('/status/listar', 
  checkPermission('visualizar'),
  AjudantesController.listarStatus
);

// GET /api/ajudantes/disponiveis/listar - Buscar ajudantes disponíveis
router.get('/disponiveis/listar', 
  checkPermission('visualizar'),
  AjudantesController.buscarAjudantesDisponiveis
);

module.exports = router;

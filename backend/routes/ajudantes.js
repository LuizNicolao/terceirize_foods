const express = require('express');
const { authenticateToken, checkPermission } = require('../middleware/auth');
const { auditMiddleware, auditChangesMiddleware, AUDIT_ACTIONS } = require('../utils/audit');
const { ajudanteValidations, ajudanteAtualizacaoValidations, handleValidationErrors } = require('../middleware/validation');
const { paginationMiddleware } = require('../middleware/pagination');
const { hateoasMiddleware } = require('../middleware/hateoas');
const ajudantesController = require('../controllers/ajudantesController');

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// ===== ROTAS PRINCIPAIS DE AJUDANTES =====

// Listar ajudantes com paginação, busca e filtros
router.get('/', 
  checkPermission('visualizar'),
  paginationMiddleware,
  ajudantesController.listarAjudantes,
  hateoasMiddleware
);

// ===== ROTAS ESPECÍFICAS =====

// Buscar ajudantes ativos
router.get('/ativos/listar', 
  checkPermission('visualizar'),
  ajudantesController.buscarAjudantesAtivos,
  hateoasMiddleware
);

// Buscar ajudantes por filial
router.get('/filial/:filialId', 
  checkPermission('visualizar'),
  ajudantesController.buscarAjudantesPorFilial,
  hateoasMiddleware
);

// Buscar ajudantes por status
router.get('/status/:status', 
  checkPermission('visualizar'),
  ajudantesController.buscarAjudantesPorStatus,
  hateoasMiddleware
);

// Listar status disponíveis
router.get('/status/listar', 
  checkPermission('visualizar'),
  ajudantesController.listarStatus,
  hateoasMiddleware
);

// Buscar ajudantes disponíveis
router.get('/disponiveis/listar', 
  checkPermission('visualizar'),
  ajudantesController.buscarAjudantesDisponiveis,
  hateoasMiddleware
);

// ===== ROTAS CRUD PRINCIPAIS =====

// Buscar ajudante por ID
router.get('/:id', 
  checkPermission('visualizar'),
  ajudantesController.buscarAjudantePorId,
  hateoasMiddleware
);

// Criar ajudante
router.post('/', [
  checkPermission('criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'ajudantes'),
  ajudanteValidations,
  handleValidationErrors
], ajudantesController.criarAjudante);

// Atualizar ajudante
router.put('/:id', [
  checkPermission('editar'),
  auditChangesMiddleware(AUDIT_ACTIONS.UPDATE, 'ajudantes'),
  ajudanteAtualizacaoValidations,
  handleValidationErrors
], ajudantesController.atualizarAjudante);

// Excluir ajudante
router.delete('/:id', [
  checkPermission('excluir'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'ajudantes')
], ajudantesController.excluirAjudante);

module.exports = router; 
const express = require('express');
const { authenticateToken, checkPermission } = require('../middleware/auth');
const { auditMiddleware, auditChangesMiddleware, AUDIT_ACTIONS } = require('../utils/audit');
const { rotaValidations, rotaAtualizacaoValidations, handleValidationErrors } = require('../middleware/validation');
const { paginationMiddleware } = require('../middleware/pagination');
const { hateoasMiddleware } = require('../middleware/hateoas');
const rotasController = require('../controllers/rotasController');

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// ===== ROTAS PRINCIPAIS DE ROTAS =====

// Listar rotas com paginação, busca e filtros
router.get('/', 
  checkPermission('visualizar'),
  paginationMiddleware,
  rotasController.listarRotas,
  hateoasMiddleware
);

// ===== ROTAS ESPECÍFICAS =====

// Buscar rotas ativas
router.get('/ativas/listar', 
  checkPermission('visualizar'),
  rotasController.buscarRotasAtivas,
  hateoasMiddleware
);

// Buscar rotas por filial
router.get('/filial/:filialId', 
  checkPermission('visualizar'),
  rotasController.buscarRotasPorFilial,
  hateoasMiddleware
);

// Buscar rotas por tipo
router.get('/tipo/:tipo', 
  checkPermission('visualizar'),
  rotasController.buscarRotasPorTipo,
  hateoasMiddleware
);

// Listar tipos de rota
router.get('/tipos/listar', 
  checkPermission('visualizar'),
  rotasController.listarTiposRota,
  hateoasMiddleware
);

// Buscar estatísticas das rotas
router.get('/estatisticas', 
  checkPermission('visualizar'),
  rotasController.buscarEstatisticasRotas,
  hateoasMiddleware
);

// Buscar unidades escolares de uma rota
router.get('/:id/unidades-escolares', 
  checkPermission('visualizar'),
  rotasController.buscarUnidadesEscolaresRota,
  hateoasMiddleware
);

// ===== ROTAS CRUD PRINCIPAIS =====

// Buscar rota por ID
router.get('/:id', 
  checkPermission('visualizar'),
  rotasController.buscarRotaPorId,
  hateoasMiddleware
);

// Criar rota
router.post('/', [
  checkPermission('criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'rotas'),
  rotaValidations,
  handleValidationErrors
], rotasController.criarRota);

// Atualizar rota
router.put('/:id', [
  checkPermission('editar'),
  auditChangesMiddleware(AUDIT_ACTIONS.UPDATE, 'rotas'),
  rotaAtualizacaoValidations,
  handleValidationErrors
], rotasController.atualizarRota);

// Excluir rota
router.delete('/:id', [
  checkPermission('excluir'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'rotas')
], rotasController.excluirRota);

module.exports = router; 
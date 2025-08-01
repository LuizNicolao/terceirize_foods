const express = require('express');
const { authenticateToken, checkPermission } = require('../middleware/auth');
const { auditMiddleware, auditChangesMiddleware, AUDIT_ACTIONS } = require('../utils/audit');
const { unidadeValidations, unidadeAtualizacaoValidations, handleValidationErrors } = require('../middleware/validation');
const { paginationMiddleware } = require('../middleware/pagination');
const { hateoasMiddleware } = require('../middleware/hateoas');
const unidadesController = require('../controllers/unidadesController');

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// ===== ROTAS PRINCIPAIS DE UNIDADES =====

// Listar unidades com paginação, busca e filtros
router.get('/', 
  checkPermission('visualizar'),
  paginationMiddleware,
  unidadesController.listarUnidades,
  hateoasMiddleware
);

// ===== ROTAS ESPECÍFICAS =====

// Buscar unidades ativas
router.get('/ativas/listar', 
  checkPermission('visualizar'),
  unidadesController.buscarUnidadesAtivas,
  hateoasMiddleware
);

// Buscar unidades por tipo
router.get('/tipo/:tipo', 
  checkPermission('visualizar'),
  unidadesController.buscarUnidadesPorTipo,
  hateoasMiddleware
);

// Listar tipos de unidades disponíveis
router.get('/tipos/listar', 
  checkPermission('visualizar'),
  unidadesController.listarTiposUnidades,
  hateoasMiddleware
);

// Buscar unidades mais utilizadas
router.get('/mais-utilizadas', 
  checkPermission('visualizar'),
  unidadesController.buscarUnidadesMaisUtilizadas,
  hateoasMiddleware
);

// ===== ROTAS CRUD PRINCIPAIS =====

// Buscar unidade por ID
router.get('/:id', 
  checkPermission('visualizar'),
  unidadesController.buscarUnidadePorId,
  hateoasMiddleware
);

// Criar unidade
router.post('/', [
  checkPermission('criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'unidades_medida')
], unidadesController.criarUnidade);

// Atualizar unidade
router.put('/:id', [
  checkPermission('editar'),
  auditChangesMiddleware(AUDIT_ACTIONS.UPDATE, 'unidades_medida')
], unidadesController.atualizarUnidade);

// Excluir unidade
router.delete('/:id', [
  checkPermission('excluir'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'unidades_medida')
], unidadesController.excluirUnidade);

module.exports = router; 
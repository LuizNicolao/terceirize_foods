const express = require('express');
const { authenticateToken, checkPermission } = require('../middleware/auth');
const { auditMiddleware, auditChangesMiddleware, AUDIT_ACTIONS } = require('../utils/audit');
const { unidadeEscolarValidations, unidadeEscolarAtualizacaoValidations } = require('../middleware/validation');
const { paginationMiddleware } = require('../middleware/pagination');
const { hateoasMiddleware } = require('../middleware/hateoas');
const { handleValidationErrors } = require('../middleware/responseHandler');
const unidadesEscolaresController = require('../controllers/unidadesEscolaresController');

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// ===== ROTAS PRINCIPAIS DE UNIDADES ESCOLARES =====

// Listar unidades escolares com paginação, busca e filtros
router.get('/', 
  checkPermission('visualizar'),
  paginationMiddleware,
  unidadesEscolaresController.listarUnidadesEscolares,
  hateoasMiddleware
);

// ===== ROTAS ESPECÍFICAS =====

// Buscar unidades escolares ativas
router.get('/ativas/listar', 
  checkPermission('visualizar'),
  unidadesEscolaresController.buscarUnidadesEscolaresAtivas,
  hateoasMiddleware
);

// Buscar unidades escolares por estado
router.get('/estado/:estado', 
  checkPermission('visualizar'),
  unidadesEscolaresController.buscarUnidadesEscolaresPorEstado,
  hateoasMiddleware
);

// Buscar unidades escolares por rota
router.get('/rota/:rotaId', 
  checkPermission('visualizar'),
  unidadesEscolaresController.buscarUnidadesEscolaresPorRota,
  hateoasMiddleware
);

// Listar estados disponíveis
router.get('/estados/listar', 
  checkPermission('visualizar'),
  unidadesEscolaresController.listarEstados,
  hateoasMiddleware
);

// Listar centros de distribuição disponíveis
router.get('/centros-distribuicao/listar', 
  checkPermission('visualizar'),
  unidadesEscolaresController.listarCentrosDistribuicao,
  hateoasMiddleware
);

// ===== ROTAS CRUD PRINCIPAIS =====

// Buscar unidade escolar por ID
router.get('/:id', 
  checkPermission('visualizar'),
  unidadesEscolaresController.buscarUnidadeEscolarPorId,
  hateoasMiddleware
);

// Criar unidade escolar
router.post('/', [
  checkPermission('criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'unidades_escolares'),
  unidadeEscolarValidations,
  handleValidationErrors
], unidadesEscolaresController.criarUnidadeEscolar);

// Atualizar unidade escolar
router.put('/:id', [
  checkPermission('editar'),
  auditChangesMiddleware(AUDIT_ACTIONS.UPDATE, 'unidades_escolares'),
  unidadeEscolarAtualizacaoValidations,
  handleValidationErrors
], unidadesEscolaresController.atualizarUnidadeEscolar);

// Excluir unidade escolar
router.delete('/:id', [
  checkPermission('excluir'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'unidades_escolares')
], unidadesEscolaresController.excluirUnidadeEscolar);

module.exports = router; 
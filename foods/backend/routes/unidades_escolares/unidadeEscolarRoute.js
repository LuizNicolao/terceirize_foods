/**
 * Rotas de Unidades Escolares
 * Implementa padrões RESTful com HATEOAS, paginação e validação
 */

const express = require('express');
const { authenticateToken, checkScreenPermission } = require('../../middleware/auth');
const { unidadeEscolarValidations, commonValidations } = require('./unidadeEscolarValidator');
const { paginationMiddleware } = require('../../middleware/pagination');
const { hateoasMiddleware } = require('../../middleware/hateoas');
const { auditMiddleware, auditChangesMiddleware, AUDIT_ACTIONS } = require('../../utils/audit');
const unidadesEscolaresController = require('../../controllers/unidades-escolares');

const router = express.Router();

// Aplicar middlewares globais
router.use(authenticateToken);
router.use(paginationMiddleware);
router.use(hateoasMiddleware('unidades_escolares'));

// ===== ROTAS PRINCIPAIS DE UNIDADES ESCOLARES =====

// Listar unidades escolares com paginação, busca e filtros
router.get('/', 
  checkScreenPermission('unidades_escolares', 'visualizar'),
  commonValidations.search,
  ...commonValidations.pagination,
  unidadesEscolaresController.listarUnidadesEscolares
);

// ===== ROTAS ESPECÍFICAS =====

// Buscar unidades escolares ativas
router.get('/ativas/listar', 
  checkScreenPermission('unidades_escolares', 'visualizar'),
  unidadesEscolaresController.buscarUnidadesEscolaresAtivas
);

// Buscar unidades escolares por estado
router.get('/estado/:estado', 
  checkScreenPermission('unidades_escolares', 'visualizar'),
  unidadesEscolaresController.buscarUnidadesEscolaresPorEstado
);

// Buscar unidades escolares por rota
router.get('/rota/:rotaId', 
  checkScreenPermission('unidades_escolares', 'visualizar'),
  unidadesEscolaresController.buscarUnidadesEscolaresPorRota
);

// Listar estados disponíveis
router.get('/estados/listar', 
  checkScreenPermission('unidades_escolares', 'visualizar'),
  unidadesEscolaresController.listarEstados
);

// Buscar estatísticas totais
router.get('/estatisticas', 
  checkScreenPermission('unidades_escolares', 'visualizar'),
  unidadesEscolaresController.buscarEstatisticas
);

// Listar centros de distribuição disponíveis
router.get('/centros-distribuicao/listar', 
  checkScreenPermission('unidades_escolares', 'visualizar'),
  unidadesEscolaresController.listarCentrosDistribuicao
);

// ===== ROTAS CRUD PRINCIPAIS =====

// Buscar unidade escolar por ID
router.get('/:id', 
  checkScreenPermission('unidades_escolares', 'visualizar'),
  commonValidations.id,
  unidadesEscolaresController.buscarUnidadeEscolarPorId
);

// Criar unidade escolar
router.post('/', [
  checkScreenPermission('unidades_escolares', 'criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'unidades_escolares'),
  unidadeEscolarValidations.create
], unidadesEscolaresController.criarUnidadeEscolar);

// Atualizar unidade escolar
router.put('/:id', [
  checkScreenPermission('unidades_escolares', 'editar'),
  auditChangesMiddleware(AUDIT_ACTIONS.UPDATE, 'unidades_escolares'),
  unidadeEscolarValidations.update
], unidadesEscolaresController.atualizarUnidadeEscolar);

// Excluir unidade escolar
router.delete('/:id', [
  checkScreenPermission('unidades_escolares', 'excluir'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'unidades_escolares'),
  commonValidations.id
], unidadesEscolaresController.excluirUnidadeEscolar);

module.exports = router;

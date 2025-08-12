/**
 * Rotas de Rotas
 * Implementa padrões RESTful com HATEOAS, paginação e validação
 */

const express = require('express');
const { authenticateToken, checkScreenPermission } = require('../../middleware/auth');
const { rotaValidations, commonValidations } = require('./rotaValidator');
const { paginationMiddleware } = require('../../middleware/pagination');
const { hateoasMiddleware } = require('../../middleware/hateoas');
const { auditMiddleware, auditChangesMiddleware, AUDIT_ACTIONS } = require('../../utils/audit');
const rotasController = require('../../controllers/rotas');

const router = express.Router();

// Aplicar middlewares globais
router.use(authenticateToken);
router.use(paginationMiddleware);
router.use(hateoasMiddleware('rotas'));

// ===== ROTAS PRINCIPAIS DE ROTAS =====

// Listar rotas com paginação, busca e filtros
router.get('/', 
  checkScreenPermission('rotas', 'visualizar'),
  commonValidations.search,
  ...commonValidations.pagination,
  rotasController.listarRotas
);

// ===== ROTAS ESPECÍFICAS =====

// Buscar rotas ativas
router.get('/ativas/listar', 
  checkScreenPermission('rotas', 'visualizar'),
  rotasController.buscarRotasAtivas
);

// Buscar rotas por filial
router.get('/filial/:filialId', 
  checkScreenPermission('rotas', 'visualizar'),
  rotasController.buscarRotasPorFilial
);

// Buscar rotas por tipo
router.get('/tipo/:tipo', 
  checkScreenPermission('rotas', 'visualizar'),
  rotasController.buscarRotasPorTipo
);

// Listar tipos de rota
router.get('/tipos/listar', 
  checkScreenPermission('rotas', 'visualizar'),
  rotasController.listarTiposRota
);

// Buscar estatísticas das rotas
router.get('/estatisticas', 
  checkScreenPermission('rotas', 'visualizar'),
  rotasController.buscarEstatisticasRotas
);

// Buscar unidades escolares de uma rota
router.get('/:id/unidades-escolares', 
  checkScreenPermission('rotas', 'visualizar'),
  rotasController.buscarUnidadesEscolaresRota
);

// ===== ROTAS CRUD PRINCIPAIS =====

// Buscar rota por ID
router.get('/:id', 
  checkScreenPermission('rotas', 'visualizar'),
  commonValidations.id,
  rotasController.buscarRotaPorId
);

// Criar rota
router.post('/', [
  checkScreenPermission('rotas', 'criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'rotas'),
  rotaValidations.create
], rotasController.criarRota);

// Atualizar rota
router.put('/:id', [
  checkScreenPermission('rotas', 'editar'),
  auditChangesMiddleware(AUDIT_ACTIONS.UPDATE, 'rotas'),
  rotaValidations.update
], rotasController.atualizarRota);

// Excluir rota
router.delete('/:id', [
  checkScreenPermission('rotas', 'excluir'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'rotas'),
  commonValidations.id
], rotasController.excluirRota);

module.exports = router;

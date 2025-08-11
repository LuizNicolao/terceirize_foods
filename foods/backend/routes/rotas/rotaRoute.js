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
const rotasController = require('../../controllers/rotasController');

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// ===== ROTAS PRINCIPAIS DE ROTAS =====

// Listar rotas com paginação, busca e filtros
router.get('/', 
  checkScreenPermission('rotas', 'visualizar'),
  commonValidations.search,
  ...commonValidations.pagination,
  rotasController.listarRotas,
  hateoasMiddleware
);

// ===== ROTAS ESPECÍFICAS =====

// Buscar rotas ativas
router.get('/ativas/listar', 
  checkScreenPermission('rotas', 'visualizar'),
  rotasController.buscarRotasAtivas,
  hateoasMiddleware
);

// Buscar rotas por filial
router.get('/filial/:filialId', 
  checkScreenPermission('rotas', 'visualizar'),
  rotasController.buscarRotasPorFilial,
  hateoasMiddleware
);

// Buscar rotas por tipo
router.get('/tipo/:tipo', 
  checkScreenPermission('rotas', 'visualizar'),
  rotasController.buscarRotasPorTipo,
  hateoasMiddleware
);

// Listar tipos de rota
router.get('/tipos/listar', 
  checkScreenPermission('rotas', 'visualizar'),
  rotasController.listarTiposRota,
  hateoasMiddleware
);

// Buscar estatísticas das rotas
router.get('/estatisticas', 
  checkScreenPermission('rotas', 'visualizar'),
  rotasController.buscarEstatisticasRotas,
  hateoasMiddleware
);

// Buscar unidades escolares de uma rota
router.get('/:id/unidades-escolares', 
  checkScreenPermission('rotas', 'visualizar'),
  rotasController.buscarUnidadesEscolaresRota,
  hateoasMiddleware
);

// ===== ROTAS CRUD PRINCIPAIS =====

// Buscar rota por ID
router.get('/:id', 
  checkScreenPermission('rotas', 'visualizar'),
  commonValidations.id,
  rotasController.buscarRotaPorId,
  hateoasMiddleware
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

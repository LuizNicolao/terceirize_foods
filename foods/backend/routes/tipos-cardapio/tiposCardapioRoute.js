/**
 * Rotas de Tipos de Cardápio
 * Implementa padrões RESTful com HATEOAS, paginação e validação
 */

const express = require('express');
const { authenticateToken, checkScreenPermission } = require('../../middleware/auth');
const { tiposCardapioValidations, commonValidations } = require('./tiposCardapioValidator');
const { paginationMiddleware } = require('../../middleware/pagination');
const { hateoasMiddleware } = require('../../middleware/hateoas');
const { auditMiddleware, auditChangesMiddleware, AUDIT_ACTIONS } = require('../../utils/audit');
const tiposCardapioController = require('../../controllers/tiposCardapio');

const router = express.Router();

// Aplicar middlewares globais
router.use(authenticateToken);
router.use(paginationMiddleware);
router.use(hateoasMiddleware('tipos_cardapio'));

// ===== ROTAS PRINCIPAIS DE TIPOS DE CARDÁPIO =====

// Listar tipos de cardápio com paginação, busca e filtros
router.get('/', 
  checkScreenPermission('tipos_cardapio', 'visualizar'),
  commonValidations.search,
  ...commonValidations.pagination,
  tiposCardapioValidations.filtros,
  tiposCardapioController.listar
);

// ===== ROTAS ESPECÍFICAS =====

// Buscar tipos de cardápio ativos
router.get('/ativas/listar', 
  checkScreenPermission('tipos_cardapio', 'visualizar'),
  tiposCardapioController.buscarAtivos
);

// Buscar tipos de cardápio por filial
router.get('/filial/:filialId', 
  checkScreenPermission('tipos_cardapio', 'visualizar'),
  tiposCardapioValidations.buscarPorFilial,
  tiposCardapioController.buscarPorFilial
);

// Buscar tipos de cardápio disponíveis para uma unidade escolar
router.get('/unidade-escolar/:unidadeEscolarId/disponiveis', 
  checkScreenPermission('tipos_cardapio', 'visualizar'),
  tiposCardapioValidations.buscarDisponiveisParaUnidade,
  tiposCardapioController.buscarDisponiveisParaUnidade
);

// Buscar tipos de cardápio por IDs específicos
router.post('/buscar-por-ids', 
  checkScreenPermission('tipos_cardapio', 'visualizar'),
  tiposCardapioValidations.buscarPorIds,
  tiposCardapioController.buscarPorIds
);

// ===== ROTAS CRUD PRINCIPAIS =====

// Buscar tipo de cardápio por ID
router.get('/:id', 
  checkScreenPermission('tipos_cardapio', 'visualizar'),
  commonValidations.id,
  tiposCardapioController.buscarPorId
);

// Criar tipo de cardápio
router.post('/', [
  checkScreenPermission('tipos_cardapio', 'criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'tipos_cardapio'),
  tiposCardapioValidations.create
], tiposCardapioController.criar);

// Atualizar tipo de cardápio
router.put('/:id', [
  checkScreenPermission('tipos_cardapio', 'editar'),
  auditChangesMiddleware(AUDIT_ACTIONS.UPDATE, 'tipos_cardapio'),
  tiposCardapioValidations.update
], tiposCardapioController.atualizar);

// Excluir tipo de cardápio
router.delete('/:id', [
  checkScreenPermission('tipos_cardapio', 'excluir'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'tipos_cardapio'),
  commonValidations.id
], tiposCardapioController.excluir);

// Listar tipos de cardápio por filial
router.get('/filial/:filialId', 
  checkScreenPermission('tipos_cardapio', 'visualizar'),
  tiposCardapioController.listarPorFilial
);

module.exports = router;

/**
 * Rotas de Almoxarifado Estoque
 * Implementa padrões RESTful com HATEOAS, paginação e validação
 */

const express = require('express');
const { authenticateToken, checkPermission } = require('../../middleware/auth');
const { almoxarifadoEstoqueValidations, commonValidations } = require('./almoxarifadoEstoqueValidator');
const { paginationMiddleware } = require('../../middleware/pagination');
const { hateoasMiddleware } = require('../../middleware/hateoas');
const { auditMiddleware, auditChangesMiddleware, AUDIT_ACTIONS } = require('../../utils/audit');
const AlmoxarifadoEstoqueController = require('../../controllers/almoxarifado-estoque');

const router = express.Router();

// Aplicar middlewares globais
router.use(authenticateToken);
router.use(paginationMiddleware);
router.use(hateoasMiddleware('almoxarifado-estoque'));

// GET /api/almoxarifado-estoque - Listar estoques com paginação e busca
router.get('/', 
  checkPermission('visualizar'),
  commonValidations.search,
  commonValidations.pagination,
  AlmoxarifadoEstoqueController.listarEstoques
);

// GET /api/almoxarifado-estoque/estatisticas - Buscar estatísticas de estoques
router.get('/estatisticas',
  checkPermission('visualizar'),
  AlmoxarifadoEstoqueController.buscarEstatisticas
);

// GET /api/almoxarifado-estoque/:id - Buscar estoque por ID
router.get('/:id', 
  checkPermission('visualizar'),
  commonValidations.id,
  AlmoxarifadoEstoqueController.buscarEstoquePorId
);

// POST /api/almoxarifado-estoque - Criar novo estoque
router.post('/', 
  checkPermission('criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'almoxarifado-estoque'),
  almoxarifadoEstoqueValidations.create,
  AlmoxarifadoEstoqueController.criarEstoque
);

// PUT /api/almoxarifado-estoque/:id - Atualizar estoque
router.put('/:id', 
  checkPermission('editar'),
  auditChangesMiddleware(AUDIT_ACTIONS.UPDATE, 'almoxarifado-estoque'),
  almoxarifadoEstoqueValidations.update,
  AlmoxarifadoEstoqueController.atualizarEstoque
);

// DELETE /api/almoxarifado-estoque/:id - Excluir estoque (soft delete)
router.delete('/:id', 
  checkPermission('excluir'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'almoxarifado-estoque'),
  commonValidations.id,
  AlmoxarifadoEstoqueController.excluirEstoque
);

module.exports = router;


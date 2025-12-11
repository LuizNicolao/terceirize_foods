const express = require('express');
const router = express.Router();
const { authenticateToken, checkScreenPermission } = require('../../middleware/auth');
const { paginationMiddleware } = require('../../middleware/pagination');
const { hateoasMiddleware } = require('../../middleware/hateoas');
const { auditMiddleware, AUDIT_ACTIONS } = require('../../utils/audit');

const { CardapiosCRUDController } = require('../../controllers/cardapios');
const { CardapiosListController } = require('../../controllers/cardapios');
const { NecessidadesCardapioController } = require('../../controllers/cardapios');
const { cardapiosValidations, commonValidations } = require('./cardapioValidator');

/**
 * Rotas para Cardápios
 * Segue padrão RESTful e excelência do sistema
 */

// Aplicar middlewares globais
router.use(authenticateToken);
router.use(paginationMiddleware);
router.use(hateoasMiddleware('cardapios'));

// GET /cardapios - Listar cardápios
router.get(
  '/',
  checkScreenPermission('cardapios', 'visualizar'),
  commonValidations.search,
  commonValidations.pagination,
  commonValidations.sort,
  cardapiosValidations.filtros,
  CardapiosListController.listar
);

// GET /cardapios/exportar/json - Exportar cardápios em JSON
router.get(
  '/exportar/json',
  checkScreenPermission('cardapios', 'visualizar'),
  CardapiosListController.exportarJSON
);

// POST /cardapios/gerar-necessidade - Gerar necessidade de cardápio
router.post(
  '/gerar-necessidade',
  checkScreenPermission('cardapios', 'visualizar'),
  NecessidadesCardapioController.gerar
);

// GET /cardapios/necessidades - Listar necessidades geradas
router.get(
  '/necessidades',
  checkScreenPermission('cardapios', 'visualizar'),
  commonValidations.pagination,
  NecessidadesCardapioController.listar
);

// GET /cardapios/necessidades/exportar/json - Exportar necessidades em JSON
router.get(
  '/necessidades/exportar/json',
  checkScreenPermission('cardapios', 'visualizar'),
  NecessidadesCardapioController.exportarJSON
);

// GET /cardapios/:id - Buscar cardápio por ID
router.get(
  '/:id',
  checkScreenPermission('cardapios', 'visualizar'),
  commonValidations.id,
  CardapiosCRUDController.buscarPorId
);

// POST /cardapios - Criar novo cardápio
router.post(
  '/',
  checkScreenPermission('cardapios', 'criar'),
  cardapiosValidations.criar,
  auditMiddleware('cardapios', AUDIT_ACTIONS.CREATE),
  CardapiosCRUDController.criar
);

// PUT /cardapios/:id - Atualizar cardápio
router.put(
  '/:id',
  checkScreenPermission('cardapios', 'editar'),
  commonValidations.id,
  cardapiosValidations.atualizar,
  auditMiddleware('cardapios', AUDIT_ACTIONS.UPDATE),
  CardapiosCRUDController.atualizar
);

// DELETE /cardapios/:id - Excluir cardápio
router.delete(
  '/:id',
  checkScreenPermission('cardapios', 'excluir'),
  commonValidations.id,
  auditMiddleware('cardapios', AUDIT_ACTIONS.DELETE),
  CardapiosCRUDController.excluir
);

module.exports = router;


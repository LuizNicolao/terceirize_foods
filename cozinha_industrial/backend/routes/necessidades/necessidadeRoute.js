const express = require('express');
const router = express.Router();
const { authenticateToken, checkScreenPermission } = require('../../middleware/auth');
const { paginationMiddleware } = require('../../middleware/pagination');
const { hateoasMiddleware } = require('../../middleware/hateoas');
const { auditMiddleware, AUDIT_ACTIONS } = require('../../utils/audit');

const {
  NecessidadesListController,
  NecessidadesCRUDController,
  NecessidadesGeracaoController,
  NecessidadesExportController
} = require('../../controllers/necessidades');
const { necessidadesValidations, commonValidations } = require('./necessidadeValidator');

/**
 * Rotas para Necessidades
 * Segue padrão RESTful e excelência do sistema
 */

// Aplicar middlewares globais
router.use(authenticateToken);
router.use(paginationMiddleware);
router.use(hateoasMiddleware('necessidades'));

// GET /necessidades - Listar necessidades
router.get(
  '/',
  checkScreenPermission('necessidades', 'visualizar'),
  commonValidations.search,
  commonValidations.pagination,
  commonValidations.sort,
  necessidadesValidations.filtros,
  NecessidadesListController.listar
);

// GET /necessidades/exportar/json - Exportar necessidades em JSON
router.get(
  '/exportar/json',
  checkScreenPermission('necessidades', 'visualizar'),
  necessidadesValidations.filtros,
  NecessidadesListController.exportarJSON
);

// GET /necessidades/exportar/xlsx - Exportar itens de necessidades em XLSX
router.get(
  '/exportar/xlsx',
  checkScreenPermission('necessidades', 'visualizar'),
  necessidadesValidations.filtros,
  NecessidadesExportController.exportarXLSX
);

// GET /necessidades/exportar/pdf - Exportar itens de necessidades em PDF
router.get(
  '/exportar/pdf',
  checkScreenPermission('necessidades', 'visualizar'),
  necessidadesValidations.filtros,
  NecessidadesExportController.exportarPDF
);

// POST /necessidades/previsualizar - Pré-visualizar necessidade (calcular sem salvar)
router.post(
  '/previsualizar',
  checkScreenPermission('necessidades', 'criar'),
  necessidadesValidations.previsualizar,
  NecessidadesGeracaoController.previsualizar
);

// POST /necessidades/gerar - Gerar e salvar necessidade
router.post(
  '/gerar',
  checkScreenPermission('necessidades', 'criar'),
  necessidadesValidations.gerar,
  auditMiddleware('necessidades', AUDIT_ACTIONS.CREATE),
  NecessidadesGeracaoController.gerar
);

// POST /necessidades/:id/recalcular - Recalcular necessidade existente
router.post(
  '/:id/recalcular',
  checkScreenPermission('necessidades', 'editar'),
  commonValidations.id,
  necessidadesValidations.recalcular,
  auditMiddleware('necessidades', AUDIT_ACTIONS.UPDATE),
  NecessidadesGeracaoController.recalcular
);

// GET /necessidades/:id - Buscar necessidade por ID com itens
router.get(
  '/:id',
  checkScreenPermission('necessidades', 'visualizar'),
  commonValidations.id,
  NecessidadesListController.buscarPorId
);

// DELETE /necessidades/:id - Excluir necessidade
router.delete(
  '/:id',
  checkScreenPermission('necessidades', 'excluir'),
  commonValidations.id,
  auditMiddleware('necessidades', AUDIT_ACTIONS.DELETE),
  NecessidadesCRUDController.excluir
);

module.exports = router;

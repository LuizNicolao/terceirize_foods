const express = require('express');
const router = express.Router();
const { authenticateToken, checkScreenPermission } = require('../../middleware/auth');
const { paginationMiddleware } = require('../../middleware/pagination');
const { hateoasMiddleware } = require('../../middleware/hateoas');
const { auditMiddleware, AUDIT_ACTIONS } = require('../../utils/audit');

const { TiposCardapioCRUDController } = require('../../controllers/tipos-cardapio');
const { TiposCardapioListController } = require('../../controllers/tipos-cardapio');
const TiposCardapioExportController = require('../../controllers/tipos-cardapio/TiposCardapioExportController');
const { tiposCardapioValidations, commonValidations } = require('./tiposCardapioValidator');

/**
 * Rotas para Tipos de Cardápio
 * Segue padrão RESTful e excelência do sistema
 */

// Aplicar middlewares globais
router.use(authenticateToken);
router.use(paginationMiddleware);
router.use(hateoasMiddleware('tipos-cardapio'));

// GET /tipos-cardapio - Listar tipos de cardápio
router.get(
  '/',
  checkScreenPermission('tipos-cardapio', 'visualizar'),
  commonValidations.search,
  commonValidations.pagination,
  commonValidations.sort,
  tiposCardapioValidations.filtros,
  TiposCardapioListController.listar
);

// GET /tipos-cardapio/exportar/json - Exportar tipos de cardápio em JSON
router.get(
  '/exportar/json',
  checkScreenPermission('tipos-cardapio', 'visualizar'),
  TiposCardapioListController.exportarJSON
);

// GET /tipos-cardapio/exportar/xlsx - Exportar tipos de cardápio em XLSX
router.get(
  '/exportar/xlsx',
  checkScreenPermission('tipos-cardapio', 'visualizar'),
  TiposCardapioExportController.exportarXLSX
);

// GET /tipos-cardapio/exportar/pdf - Exportar tipos de cardápio em PDF
router.get(
  '/exportar/pdf',
  checkScreenPermission('tipos-cardapio', 'visualizar'),
  TiposCardapioExportController.exportarPDF
);

// GET /tipos-cardapio/unidades - Buscar tipos de cardápio vinculados a unidades
// IMPORTANTE: Esta rota deve vir ANTES de /:id para evitar conflito de roteamento
router.get(
  '/unidades',
  checkScreenPermission('tipos-cardapio', 'visualizar'),
  TiposCardapioListController.buscarTiposCardapioPorUnidades
);

// GET /tipos-cardapio/:id - Buscar tipo de cardápio por ID
router.get(
  '/:id',
  checkScreenPermission('tipos-cardapio', 'visualizar'),
  commonValidations.id,
  TiposCardapioCRUDController.buscarPorId
);

// GET /tipos-cardapio/:id/unidades - Buscar unidades vinculadas
router.get(
  '/:id/unidades',
  checkScreenPermission('tipos-cardapio', 'visualizar'),
  commonValidations.id,
  TiposCardapioListController.buscarUnidadesVinculadas
);

// GET /tipos-cardapio/:id/produtos - Buscar produtos vinculados
router.get(
  '/:id/produtos',
  checkScreenPermission('tipos-cardapio', 'visualizar'),
  commonValidations.id,
  TiposCardapioListController.buscarProdutosVinculados
);

// POST /tipos-cardapio - Criar novo tipo de cardápio
router.post(
  '/',
  checkScreenPermission('tipos-cardapio', 'criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'tipos-cardapio'),
  tiposCardapioValidations.criar,
  TiposCardapioCRUDController.criar
);

// PUT /tipos-cardapio/:id - Atualizar tipo de cardápio
router.put(
  '/:id',
  checkScreenPermission('tipos-cardapio', 'editar'),
  auditMiddleware(AUDIT_ACTIONS.UPDATE, 'tipos-cardapio'),
  commonValidations.id,
  tiposCardapioValidations.atualizar,
  TiposCardapioCRUDController.atualizar
);

// DELETE /tipos-cardapio/:id - Excluir tipo de cardápio
router.delete(
  '/:id',
  checkScreenPermission('tipos-cardapio', 'excluir'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'tipos-cardapio'),
  commonValidations.id,
  TiposCardapioCRUDController.excluir
);

module.exports = router;


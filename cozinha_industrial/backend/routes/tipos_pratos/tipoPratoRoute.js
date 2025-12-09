const express = require('express');
const router = express.Router();
const { authenticateToken, checkScreenPermission } = require('../../middleware/auth');
const { tiposPratosLimiter } = require('../../middleware/rateLimiter');
const { paginationMiddleware } = require('../../middleware/pagination');
const { hateoasMiddleware } = require('../../middleware/hateoas');
const { auditMiddleware, AUDIT_ACTIONS } = require('../../utils/audit');

const { TiposPratosCRUDController } = require('../../controllers/tipos_pratos');
const { TiposPratosListController } = require('../../controllers/tipos_pratos');
const { TiposPratosExportController } = require('../../controllers/tipos_pratos');
const { tiposPratosValidations, commonValidations } = require('./tipoPratoValidator');

/**
 * Rotas para Tipos de Pratos
 * Segue padrão RESTful e excelência do sistema
 */

// Aplicar middlewares globais
router.use(tiposPratosLimiter);
router.use(authenticateToken);
router.use(paginationMiddleware);
router.use(hateoasMiddleware('tipos_pratos'));

// GET /tipos-pratos - Listar tipos de pratos
router.get(
  '/',
  checkScreenPermission('tipos_pratos', 'visualizar'),
  commonValidations.search,
  commonValidations.pagination,
  commonValidations.sort,
  tiposPratosValidations.filtros,
  TiposPratosListController.listar
);

// GET /tipos-pratos/exportar/json - Exportar tipos de pratos em JSON
router.get(
  '/exportar/json',
  checkScreenPermission('tipos_pratos', 'visualizar'),
  TiposPratosListController.exportarJSON
);

// GET /tipos-pratos/exportar/xlsx - Exportar tipos de pratos em XLSX
router.get(
  '/exportar/xlsx',
  checkScreenPermission('tipos_pratos', 'visualizar'),
  TiposPratosExportController.exportarXLSX
);

// GET /tipos-pratos/exportar/pdf - Exportar tipos de pratos em PDF
router.get(
  '/exportar/pdf',
  checkScreenPermission('tipos_pratos', 'visualizar'),
  TiposPratosExportController.exportarPDF
);

// GET /tipos-pratos/:id - Buscar tipo de prato por ID
router.get(
  '/:id',
  checkScreenPermission('tipos_pratos', 'visualizar'),
  commonValidations.id,
  TiposPratosCRUDController.buscarPorId
);

// POST /tipos-pratos - Criar novo tipo de prato
router.post(
  '/',
  checkScreenPermission('tipos_pratos', 'criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'tipos_pratos'),
  tiposPratosValidations.criar,
  TiposPratosCRUDController.criar
);

// PUT /tipos-pratos/:id - Atualizar tipo de prato
router.put(
  '/:id',
  checkScreenPermission('tipos_pratos', 'editar'),
  auditMiddleware(AUDIT_ACTIONS.UPDATE, 'tipos_pratos'),
  commonValidations.id,
  tiposPratosValidations.atualizar,
  TiposPratosCRUDController.atualizar
);

// DELETE /tipos-pratos/:id - Excluir tipo de prato
router.delete(
  '/:id',
  checkScreenPermission('tipos_pratos', 'excluir'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'tipos_pratos'),
  commonValidations.id,
  TiposPratosCRUDController.excluir
);

module.exports = router;


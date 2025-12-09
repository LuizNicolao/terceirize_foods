const express = require('express');
const router = express.Router();
const { authenticateToken, checkScreenPermission } = require('../../middleware/auth');
const { pratosLimiter } = require('../../middleware/rateLimiter');
const { paginationMiddleware } = require('../../middleware/pagination');
const { hateoasMiddleware } = require('../../middleware/hateoas');
const { auditMiddleware, AUDIT_ACTIONS } = require('../../utils/audit');

const { PratosCRUDController } = require('../../controllers/pratos');
const { PratosListController } = require('../../controllers/pratos');
const { pratosValidations, commonValidations } = require('./pratoValidator');

/**
 * Rotas para Pratos
 * Segue padrão RESTful e excelência do sistema
 */

// Aplicar middlewares globais
router.use(pratosLimiter);
router.use(authenticateToken);
router.use(paginationMiddleware);
router.use(hateoasMiddleware('pratos'));

// GET /pratos - Listar pratos
router.get(
  '/',
  checkScreenPermission('pratos', 'visualizar'),
  commonValidations.search,
  commonValidations.pagination,
  commonValidations.sort,
  pratosValidations.filtros,
  PratosListController.listar
);

// GET /pratos/exportar/json - Exportar pratos em JSON
router.get(
  '/exportar/json',
  checkScreenPermission('pratos', 'visualizar'),
  PratosListController.exportarJSON
);

// GET /pratos/:id - Buscar prato por ID
router.get(
  '/:id',
  checkScreenPermission('pratos', 'visualizar'),
  commonValidations.id,
  PratosCRUDController.buscarPorId
);

// POST /pratos - Criar novo prato
router.post(
  '/',
  checkScreenPermission('pratos', 'criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'pratos'),
  pratosValidations.criar,
  PratosCRUDController.criar
);

// PUT /pratos/:id - Atualizar prato
router.put(
  '/:id',
  checkScreenPermission('pratos', 'editar'),
  auditMiddleware(AUDIT_ACTIONS.UPDATE, 'pratos'),
  commonValidations.id,
  pratosValidations.atualizar,
  PratosCRUDController.atualizar
);

// DELETE /pratos/:id - Excluir prato
router.delete(
  '/:id',
  checkScreenPermission('pratos', 'excluir'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'pratos'),
  commonValidations.id,
  PratosCRUDController.excluir
);

module.exports = router;


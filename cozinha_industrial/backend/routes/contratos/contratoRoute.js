const express = require('express');
const router = express.Router();
const { authenticateToken, checkScreenPermission } = require('../../middleware/auth');
const { contratosLimiter } = require('../../middleware/rateLimiter');
const { paginationMiddleware } = require('../../middleware/pagination');
const { hateoasMiddleware } = require('../../middleware/hateoas');
const { auditMiddleware, AUDIT_ACTIONS } = require('../../utils/audit');

const { ContratosCRUDController } = require('../../controllers/contratos');
const { ContratosListController } = require('../../controllers/contratos');
const { contratosValidations, commonValidations } = require('./contratoValidator');

/**
 * Rotas para Contratos
 * Segue padrão RESTful e excelência do sistema
 */

// Aplicar middlewares globais
router.use(contratosLimiter);
router.use(authenticateToken);
router.use(paginationMiddleware);
router.use(hateoasMiddleware('contratos'));

// GET /contratos - Listar contratos
router.get(
  '/',
  checkScreenPermission('contratos', 'visualizar'),
  commonValidations.search,
  commonValidations.pagination,
  commonValidations.sort,
  contratosValidations.filtros,
  ContratosListController.listar
);

// GET /contratos/exportar/json - Exportar contratos em JSON
router.get(
  '/exportar/json',
  checkScreenPermission('contratos', 'visualizar'),
  ContratosListController.exportarJSON
);

// GET /contratos/:id - Buscar contrato por ID
router.get(
  '/:id',
  checkScreenPermission('contratos', 'visualizar'),
  commonValidations.id,
  ContratosCRUDController.buscarPorId
);

// GET /contratos/:id/unidades - Buscar unidades vinculadas a um contrato
router.get(
  '/:id/unidades',
  checkScreenPermission('contratos', 'visualizar'),
  commonValidations.id,
  ContratosListController.buscarUnidadesVinculadas
);

// GET /contratos/:id/produtos - Buscar produtos vinculados a um contrato
router.get(
  '/:id/produtos',
  checkScreenPermission('contratos', 'visualizar'),
  commonValidations.id,
  ContratosListController.buscarProdutosVinculados
);

// POST /contratos - Criar novo contrato
router.post(
  '/',
  checkScreenPermission('contratos', 'criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'contratos'),
  contratosValidations.criar,
  ContratosCRUDController.criar
);

// POST /contratos/:id/vincular-unidades - Vincular unidades a um contrato
router.post(
  '/:id/vincular-unidades',
  checkScreenPermission('contratos', 'editar'),
  auditMiddleware(AUDIT_ACTIONS.UPDATE, 'contratos'),
  commonValidations.id,
  contratosValidations.vincularUnidades,
  ContratosCRUDController.vincularUnidades
);

// POST /contratos/:id/vincular-produtos - Vincular produtos a um contrato
router.post(
  '/:id/vincular-produtos',
  checkScreenPermission('contratos', 'editar'),
  auditMiddleware(AUDIT_ACTIONS.UPDATE, 'contratos'),
  commonValidations.id,
  contratosValidations.vincularProdutos,
  ContratosCRUDController.vincularProdutos
);

// PUT /contratos/:id - Atualizar contrato
router.put(
  '/:id',
  checkScreenPermission('contratos', 'editar'),
  auditMiddleware(AUDIT_ACTIONS.UPDATE, 'contratos'),
  commonValidations.id,
  contratosValidations.atualizar,
  ContratosCRUDController.atualizar
);

// DELETE /contratos/:id - Excluir contrato
router.delete(
  '/:id',
  checkScreenPermission('contratos', 'excluir'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'contratos'),
  commonValidations.id,
  ContratosCRUDController.excluir
);

module.exports = router;


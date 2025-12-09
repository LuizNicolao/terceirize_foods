const express = require('express');
const router = express.Router();
const { authenticateToken, checkScreenPermission } = require('../../middleware/auth');
const { tiposReceitasLimiter } = require('../../middleware/rateLimiter');
const { paginationMiddleware } = require('../../middleware/pagination');
const { hateoasMiddleware } = require('../../middleware/hateoas');
const { auditMiddleware, AUDIT_ACTIONS } = require('../../utils/audit');

const { TiposReceitasCRUDController } = require('../../controllers/tipos_receitas');
const { TiposReceitasListController } = require('../../controllers/tipos_receitas');
const { tiposReceitasValidations, commonValidations } = require('./tipoReceitaValidator');

/**
 * Rotas para Tipos de Receitas
 * Segue padrão RESTful e excelência do sistema
 */

// Aplicar middlewares globais
router.use(tiposReceitasLimiter);
router.use(authenticateToken);
router.use(paginationMiddleware);
router.use(hateoasMiddleware('tipos_receitas'));

// GET /tipos-receitas - Listar tipos de receitas
router.get(
  '/',
  checkScreenPermission('tipos_receitas', 'visualizar'),
  commonValidations.search,
  commonValidations.pagination,
  commonValidations.sort,
  tiposReceitasValidations.filtros,
  TiposReceitasListController.listar
);

// GET /tipos-receitas/exportar/json - Exportar tipos de receitas em JSON
router.get(
  '/exportar/json',
  checkScreenPermission('tipos_receitas', 'visualizar'),
  TiposReceitasListController.exportarJSON
);

// GET /tipos-receitas/:id - Buscar tipo de receita por ID
router.get(
  '/:id',
  checkScreenPermission('tipos_receitas', 'visualizar'),
  commonValidations.id,
  TiposReceitasCRUDController.buscarPorId
);

// POST /tipos-receitas - Criar novo tipo de receita
router.post(
  '/',
  checkScreenPermission('tipos_receitas', 'criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'tipos_receitas'),
  tiposReceitasValidations.criar,
  TiposReceitasCRUDController.criar
);

// PUT /tipos-receitas/:id - Atualizar tipo de receita
router.put(
  '/:id',
  checkScreenPermission('tipos_receitas', 'editar'),
  auditMiddleware(AUDIT_ACTIONS.UPDATE, 'tipos_receitas'),
  commonValidations.id,
  tiposReceitasValidations.atualizar,
  TiposReceitasCRUDController.atualizar
);

// DELETE /tipos-receitas/:id - Excluir tipo de receita
router.delete(
  '/:id',
  checkScreenPermission('tipos_receitas', 'excluir'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'tipos_receitas'),
  commonValidations.id,
  TiposReceitasCRUDController.excluir
);

module.exports = router;


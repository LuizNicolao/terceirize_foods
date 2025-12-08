/**
 * Rotas de Receitas
 * Implementa padrões RESTful com HATEOAS, paginação e validação
 */

const express = require('express');
const { authenticateToken, checkScreenPermission } = require('../../middleware/auth');
const { paginationMiddleware } = require('../../middleware/pagination');
const { hateoasMiddleware } = require('../../middleware/hateoas');
const { auditMiddleware, AUDIT_ACTIONS } = require('../../utils/audit');
const { receitasLimiter } = require('../../middleware/rateLimiter');
const { createEntityValidationHandler } = require('../../middleware/validationHandler');
const { commonValidations, receitasValidations } = require('./receitaValidator');
const ReceitasController = require('../../controllers/receitas');

const router = express.Router();

// Aplicar middlewares globais
router.use(receitasLimiter);
router.use(authenticateToken);
router.use(paginationMiddleware);
router.use(hateoasMiddleware('receitas'));

// ===== ROTAS CRUD =====
router.get('/',
  checkScreenPermission('receitas', 'visualizar'),
  commonValidations.search,
  commonValidations.pagination,
  commonValidations.sort,
  receitasValidations.filtros,
  ReceitasController.listar
);

router.get('/:id',
  checkScreenPermission('receitas', 'visualizar'),
  commonValidations.id,
  ReceitasController.buscarPorId
);

router.post('/',
  checkScreenPermission('receitas', 'criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'receitas'),
  receitasValidations.criar,
  ReceitasController.criar
);

router.put('/:id',
  checkScreenPermission('receitas', 'editar'),
  auditMiddleware(AUDIT_ACTIONS.UPDATE, 'receitas'),
  commonValidations.id,
  receitasValidations.atualizar,
  ReceitasController.atualizar
);

router.delete('/:id',
  checkScreenPermission('receitas', 'excluir'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'receitas'),
  commonValidations.id,
  ReceitasController.excluir
);

// ===== ROTA DE EXPORTAÇÃO =====
router.get('/exportar/json',
  checkScreenPermission('receitas', 'visualizar'),
  ReceitasController.exportarJSON
);

module.exports = router;


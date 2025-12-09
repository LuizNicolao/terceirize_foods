const express = require('express');
const router = express.Router();
const { authenticateToken, checkScreenPermission } = require('../../middleware/auth');
const { periodosAtendimentoLimiter } = require('../../middleware/rateLimiter');
const { paginationMiddleware } = require('../../middleware/pagination');
const { hateoasMiddleware } = require('../../middleware/hateoas');
const { auditMiddleware, AUDIT_ACTIONS } = require('../../utils/audit');

const { PeriodosAtendimentoCRUDController } = require('../../controllers/periodos-atendimento');
const { PeriodosAtendimentoListController } = require('../../controllers/periodos-atendimento');
const { periodosAtendimentoValidations, commonValidations } = require('./periodoAtendimentoValidator');

/**
 * Rotas para Períodos de Atendimento
 * Segue padrão RESTful e excelência do sistema
 */

// Aplicar middlewares globais
router.use(periodosAtendimentoLimiter);
router.use(authenticateToken);
router.use(paginationMiddleware);
router.use(hateoasMiddleware('periodos_atendimento'));

// GET /periodos-atendimento - Listar períodos de atendimento
router.get(
  '/',
  checkScreenPermission('periodos_atendimento', 'visualizar'),
  commonValidations.search,
  commonValidations.pagination,
  commonValidations.sort,
  periodosAtendimentoValidations.filtros,
  PeriodosAtendimentoListController.listar
);

// GET /periodos-atendimento/exportar/json - Exportar períodos de atendimento em JSON
router.get(
  '/exportar/json',
  checkScreenPermission('periodos_atendimento', 'visualizar'),
  PeriodosAtendimentoListController.exportarJSON
);

// GET /periodos-atendimento/:id - Buscar período de atendimento por ID
router.get(
  '/:id',
  checkScreenPermission('periodos_atendimento', 'visualizar'),
  commonValidations.id,
  PeriodosAtendimentoCRUDController.buscarPorId
);

// GET /periodos-atendimento/:id/unidades - Buscar unidades vinculadas a um período
router.get(
  '/:id/unidades',
  checkScreenPermission('periodos_atendimento', 'visualizar'),
  commonValidations.id,
  PeriodosAtendimentoListController.buscarUnidadesVinculadas
);

// POST /periodos-atendimento - Criar novo período de atendimento
router.post(
  '/',
  checkScreenPermission('periodos_atendimento', 'criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'periodos_atendimento'),
  periodosAtendimentoValidations.criar,
  PeriodosAtendimentoCRUDController.criar
);

// POST /periodos-atendimento/:id/vincular-unidades - Vincular unidades a um período
router.post(
  '/:id/vincular-unidades',
  checkScreenPermission('periodos_atendimento', 'editar'),
  auditMiddleware(AUDIT_ACTIONS.UPDATE, 'periodos_atendimento'),
  commonValidations.id,
  periodosAtendimentoValidations.vincularUnidades,
  PeriodosAtendimentoCRUDController.vincularUnidades
);

// PUT /periodos-atendimento/:id - Atualizar período de atendimento
router.put(
  '/:id',
  checkScreenPermission('periodos_atendimento', 'editar'),
  auditMiddleware(AUDIT_ACTIONS.UPDATE, 'periodos_atendimento'),
  commonValidations.id,
  periodosAtendimentoValidations.atualizar,
  PeriodosAtendimentoCRUDController.atualizar
);

// DELETE /periodos-atendimento/:id - Excluir período de atendimento
router.delete(
  '/:id',
  checkScreenPermission('periodos_atendimento', 'excluir'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'periodos_atendimento'),
  commonValidations.id,
  PeriodosAtendimentoCRUDController.excluir
);

// DELETE /periodos-atendimento/:id/desvincular-unidade/:unidadeId - Desvincular unidade de um período
router.delete(
  '/:id/desvincular-unidade/:unidadeId',
  checkScreenPermission('periodos_atendimento', 'editar'),
  auditMiddleware(AUDIT_ACTIONS.UPDATE, 'periodos_atendimento'),
  commonValidations.id,
  commonValidations.unidadeId,
  PeriodosAtendimentoCRUDController.desvincularUnidade
);

module.exports = router;


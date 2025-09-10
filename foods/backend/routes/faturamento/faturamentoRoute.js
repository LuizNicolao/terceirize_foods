/**
 * Rotas para Faturamento
 * Gerencia as operações relacionadas ao faturamento de refeições
 */

const express = require('express');
const router = express.Router();

// Middlewares
const { authenticateToken, checkScreenPermission } = require('../../middleware/auth');
const { paginationMiddleware } = require('../../middleware/pagination');
const { hateoasMiddleware } = require('../../middleware/hateoas');
const { auditMiddleware, AUDIT_ACTIONS } = require('../../utils/audit');

// Controllers
const FaturamentoController = require('../../controllers/faturamento/FaturamentoCRUDController');
const FaturamentoListController = require('../../controllers/faturamento/FaturamentoListController');
const FaturamentoExportController = require('../../controllers/faturamento/FaturamentoExportController');

// Validators
const { faturamentoValidations, commonValidations } = require('./faturamentoValidator');

// Aplicar middlewares globais
router.use(authenticateToken);
router.use(paginationMiddleware);
router.use(hateoasMiddleware('faturamento'));

// ===== ROTAS DE FATURAMENTO =====

// Listar faturamentos com paginação, busca e filtros
router.get('/', 
  checkScreenPermission('faturamento', 'visualizar'),
  ...commonValidations.pagination,
  ...faturamentoValidations.filtros,
  FaturamentoListController.listarFaturamentos
);

// Buscar faturamento por ID
router.get('/:id', 
  checkScreenPermission('faturamento', 'visualizar'),
  commonValidations.id,
  FaturamentoListController.buscarFaturamentoPorId
);

// Criar novo faturamento
router.post('/', 
  checkScreenPermission('faturamento', 'criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'faturamento'),
  ...faturamentoValidations.create,
  FaturamentoController.criarFaturamento
);

// Atualizar faturamento existente
router.put('/:id', 
  checkScreenPermission('faturamento', 'editar'),
  auditMiddleware(AUDIT_ACTIONS.UPDATE, 'faturamento'),
  commonValidations.id,
  ...faturamentoValidations.update,
  FaturamentoController.atualizarFaturamento
);

// Excluir faturamento
router.delete('/:id', 
  checkScreenPermission('faturamento', 'excluir'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'faturamento'),
  commonValidations.id,
  FaturamentoController.excluirFaturamento
);

// ===== ROTAS ESPECÍFICAS PARA FATURAMENTO =====

// Buscar faturamento por unidade escolar e período
router.get('/unidade-escolar/:unidade_escolar_id', 
  checkScreenPermission('faturamento', 'visualizar'),
  commonValidations.id,
  ...faturamentoValidations.filtros,
  FaturamentoListController.buscarFaturamentoPorUnidade
);

// Criar faturamento para unidade escolar
router.post('/unidade-escolar/:unidade_escolar_id', 
  checkScreenPermission('faturamento', 'criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'faturamento'),
  commonValidations.id,
  ...faturamentoValidations.create,
  FaturamentoController.criarFaturamentoPorUnidade
);

// Buscar períodos de refeição disponíveis para faturamento
router.get('/periodos-refeicao/disponiveis', 
  checkScreenPermission('faturamento', 'visualizar'),
  FaturamentoListController.buscarPeriodosDisponiveis
);

// Rotas de exportação
router.get('/exportar/xlsx', 
  checkScreenPermission('faturamento', 'visualizar'),
  ...faturamentoValidations.filtros,
  FaturamentoExportController.exportarXLSX
);

router.get('/exportar/pdf', 
  checkScreenPermission('faturamento', 'visualizar'),
  ...faturamentoValidations.filtros,
  FaturamentoExportController.exportarPDF
);

router.get('/:id/imprimir', 
  checkScreenPermission('faturamento', 'visualizar'),
  commonValidations.id,
  FaturamentoExportController.imprimirPDF
);

module.exports = router;

const express = require('express');
const { authenticateToken, checkScreenPermission } = require('../../middleware/auth');
const { paginationMiddleware } = require('../../middleware/pagination');
const { hateoasMiddleware } = require('../../middleware/hateoas');
const { auditMiddleware, AUDIT_ACTIONS } = require('../../utils/audit');
const { produtosLimiter } = require('../../middleware/rateLimiter');
const { createEntityValidationHandler } = require('../../middleware/validationHandler');
const { commonValidations, produtosPerCapitaValidations } = require('./produtosPerCapitaValidator');
const ProdutosPerCapitaController = require('../../controllers/produtos-per-capita');

const router = express.Router();

// Aplicar middlewares globais
router.use(produtosLimiter);
router.use(authenticateToken);
router.use(paginationMiddleware);
router.use(hateoasMiddleware('produtos-per-capita'));

// ===== ROTAS ESPECÍFICAS (DEVEM VIR ANTES DAS ROTAS COM PARÂMETROS) =====
router.get('/produtos-disponiveis',
  checkScreenPermission('produtos_per_capita', 'visualizar'),
  commonValidations.search,
  ProdutosPerCapitaController.buscarProdutosDisponiveis
);

router.post('/buscar-por-produtos',
  checkScreenPermission('produtos_per_capita', 'visualizar'),
  produtosPerCapitaValidations.buscarPorProdutos,
  ProdutosPerCapitaController.buscarPorProdutos
);

router.get('/grupos-com-percapita',
  checkScreenPermission('produtos_per_capita', 'visualizar'),
  ProdutosPerCapitaController.buscarGruposComPercapita
);

router.get('/estatisticas',
  checkScreenPermission('produtos_per_capita', 'visualizar'),
  ProdutosPerCapitaController.obterEstatisticas
);

router.get('/resumo-por-periodo',
  checkScreenPermission('produtos_per_capita', 'visualizar'),
  ProdutosPerCapitaController.obterResumoPorPeriodo
);

router.get('/estatisticas-exportacao',
  checkScreenPermission('produtos_per_capita', 'visualizar'),
  ProdutosPerCapitaController.obterEstatisticasExportacao
);

// ===== ROTAS DE EXPORTAÇÃO =====
router.get('/exportar/xlsx',
  checkScreenPermission('produtos_per_capita', 'visualizar'),
  ProdutosPerCapitaController.exportarXLSX
);

router.get('/exportar/pdf',
  checkScreenPermission('produtos_per_capita', 'visualizar'),
  ProdutosPerCapitaController.exportarPDF
);

// ===== ROTAS CRUD =====
router.get('/',
  checkScreenPermission('produtos_per_capita', 'visualizar'),
  commonValidations.search,
  commonValidations.pagination,
  commonValidations.sort,
  produtosPerCapitaValidations.filtros,
  ProdutosPerCapitaController.listar
);

router.get('/produtos-disponiveis',
  checkScreenPermission('produtos_per_capita', 'visualizar'),
  ProdutosPerCapitaController.buscarProdutosDisponiveis
);

router.get('/:id',
  checkScreenPermission('produtos_per_capita', 'visualizar'),
  commonValidations.id,
  ProdutosPerCapitaController.buscarPorId
);

router.post('/',
  checkScreenPermission('produtos_per_capita', 'criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'produtos-per-capita'),
  produtosPerCapitaValidations.criar,
  ProdutosPerCapitaController.criar
);

router.put('/:id',
  checkScreenPermission('produtos_per_capita', 'editar'),
  auditMiddleware(AUDIT_ACTIONS.UPDATE, 'produtos-per-capita'),
  commonValidations.id,
  produtosPerCapitaValidations.atualizar,
  ProdutosPerCapitaController.atualizar
);

router.delete('/:id',
  checkScreenPermission('produtos_per_capita', 'excluir'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'produtos-per-capita'),
  commonValidations.id,
  ProdutosPerCapitaController.excluir
);

module.exports = router;

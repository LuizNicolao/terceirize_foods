/**
 * Rotas de Produto Comercial
 * Implementa padrões RESTful com HATEOAS, paginação e validação
 */

const express = require('express');
const { authenticateToken, checkPermission } = require('../../middleware/auth');
const { produtoComercialValidations, commonValidations } = require('./produtoComercialValidator');
const { paginationMiddleware } = require('../../middleware/pagination');
const { hateoasMiddleware } = require('../../middleware/hateoas');
const { auditMiddleware, AUDIT_ACTIONS } = require('../../utils/audit');
const ProdutoComercialController = require('../../controllers/produto-comercial');

const router = express.Router();

// Aplicar middlewares globais
router.use(authenticateToken);
router.use(paginationMiddleware);
router.use(hateoasMiddleware('produto-comercial'));

// GET /api/produto-comercial - Listar produtos comerciais com paginação e busca
router.get('/', 
  checkPermission('visualizar'),
  commonValidations.search,
  commonValidations.pagination,
  ProdutoComercialController.listarProdutosComerciais
);

// ===== ROTAS ESPECÍFICAS (devem vir antes de /:id) =====

// GET /api/produto-comercial/proximo-codigo - Obter próximo código disponível
router.get('/proximo-codigo',
  checkPermission('visualizar'),
  ProdutoComercialController.obterProximoCodigo
);

// GET /api/produto-comercial/grupos - Listar grupos disponíveis (tipo venda)
router.get('/grupos',
  checkPermission('visualizar'),
  ProdutoComercialController.listarGrupos
);

// GET /api/produto-comercial/subgrupos - Listar subgrupos disponíveis
router.get('/subgrupos',
  checkPermission('visualizar'),
  ProdutoComercialController.listarSubgrupos
);

// GET /api/produto-comercial/classes - Listar classes disponíveis
router.get('/classes',
  checkPermission('visualizar'),
  ProdutoComercialController.listarClasses
);

// GET /api/produto-comercial/unidades-medida - Listar unidades de medida disponíveis
router.get('/unidades-medida',
  checkPermission('visualizar'),
  ProdutoComercialController.listarUnidadesMedida
);

// GET /api/produto-comercial/stats/gerais - Estatísticas gerais
router.get('/stats/gerais',
  checkPermission('visualizar'),
  ProdutoComercialController.estatisticasGerais
);

// ===== ROTAS COM PARÂMETROS (devem vir depois das rotas específicas) =====

// GET /api/produto-comercial/:id - Buscar produto comercial por ID
router.get('/:id', 
  checkPermission('visualizar'),
  commonValidations.id,
  ProdutoComercialController.buscarProdutoComercialPorId
);

// POST /api/produto-comercial - Criar novo produto comercial
router.post('/', 
  checkPermission('criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'produto_comercial'),
  produtoComercialValidations.create,
  ProdutoComercialController.criarProdutoComercial
);

// PUT /api/produto-comercial/:id - Atualizar produto comercial
router.put('/:id', 
  checkPermission('editar'),
  auditMiddleware(AUDIT_ACTIONS.UPDATE, 'produto_comercial'),
  produtoComercialValidations.update,
  ProdutoComercialController.atualizarProdutoComercial
);

// DELETE /api/produto-comercial/:id - Excluir produto comercial (soft delete)
router.delete('/:id', 
  checkPermission('excluir'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'produto_comercial'),
  commonValidations.id,
  ProdutoComercialController.excluirProdutoComercial
);

module.exports = router;


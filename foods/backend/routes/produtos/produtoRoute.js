/**
 * Rotas de Produtos
 * Implementa padrões RESTful com HATEOAS, paginação e validação
 */

const express = require('express');
const { authenticateToken, checkPermission } = require('../../middleware/auth');
const { produtoValidations, commonValidations } = require('./validators/produtoValidator');
const { paginationMiddleware } = require('../../middleware/pagination');
const { hateoasMiddleware } = require('../../middleware/hateoas');
const { auditMiddleware, AUDIT_ACTIONS } = require('../../utils/audit');
const ProdutosController = require('../../controllers/produtos');

const router = express.Router();

// Aplicar middlewares globais
router.use(authenticateToken);
router.use(paginationMiddleware);
router.use(hateoasMiddleware('produtos'));

// GET /api/produtos - Listar produtos com paginação e busca
router.get('/', 
  checkPermission('visualizar'),
  commonValidations.search,
  commonValidations.pagination,
  ProdutosController.listarProdutos
);

// GET /api/produtos/:id - Buscar produto por ID
router.get('/:id', 
  checkPermission('visualizar'),
  commonValidations.id,
  ProdutosController.buscarProdutoPorId
);

// POST /api/produtos - Criar novo produto
router.post('/', 
  checkPermission('criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'produtos'),
  produtoValidations.create,
  ProdutosController.criarProduto
);

// PUT /api/produtos/:id - Atualizar produto
router.put('/:id', 
  checkPermission('editar'),
  auditMiddleware(AUDIT_ACTIONS.UPDATE, 'produtos'),
  produtoValidations.update,
  ProdutosController.atualizarProduto
);

// DELETE /api/produtos/:id - Excluir produto (soft delete)
router.delete('/:id', 
  checkPermission('excluir'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'produtos'),
  commonValidations.id,
  ProdutosController.excluirProduto
);

// GET /api/produtos/grupo/:grupo_id - Buscar produtos por grupo
router.get('/grupo/:grupo_id',
  checkPermission('visualizar'),
  ProdutosController.buscarProdutosPorGrupo
);

// GET /api/produtos/ativos - Buscar produtos ativos
router.get('/ativos',
  checkPermission('visualizar'),
  ProdutosController.buscarProdutosAtivos
);

// GET /api/produtos/codigo/:codigo_barras - Buscar produto por código de barras
router.get('/codigo/:codigo_barras',
  checkPermission('visualizar'),
  ProdutosController.buscarProdutosPorCodigoBarras
);

// GET /api/produtos/grupos - Listar grupos disponíveis
router.get('/grupos',
  checkPermission('visualizar'),
  ProdutosController.listarGrupos
);

// GET /api/produtos/subgrupos - Listar subgrupos disponíveis
router.get('/subgrupos',
  checkPermission('visualizar'),
  ProdutosController.listarSubgrupos
);

// GET /api/produtos/classes - Listar classes disponíveis
router.get('/classes',
  checkPermission('visualizar'),
  ProdutosController.listarClasses
);

// GET /api/produtos/unidades - Listar unidades de medida disponíveis
router.get('/unidades',
  checkPermission('visualizar'),
  ProdutosController.listarUnidades
);

// GET /api/produtos/marcas - Listar marcas disponíveis
router.get('/marcas',
  checkPermission('visualizar'),
  ProdutosController.listarMarcas
);

// GET /api/produtos/estatisticas - Buscar estatísticas de produtos
router.get('/estatisticas',
  checkPermission('visualizar'),
  ProdutosController.buscarEstatisticas
);

module.exports = router; 
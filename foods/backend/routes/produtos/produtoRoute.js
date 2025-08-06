/**
 * Rotas de Produtos
 * Implementa padrões RESTful com HATEOAS, paginação e validação
 */

const express = require('express');
const { authenticateToken, checkPermission } = require('../middleware/auth');
const { produtoValidations, commonValidations } = require('../middleware/validation');
const { paginationMiddleware } = require('../middleware/pagination');
const { hateoasMiddleware } = require('../middleware/hateoas');
const { auditMiddleware, AUDIT_ACTIONS } = require('../utils/audit');
const ProdutosController = require('../controllers/produtosController');

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

// PUT /api/produtos/:id/estoque - Atualizar estoque do produto
router.put('/:id/estoque',
  checkPermission('editar'),
  produtoValidations.estoque,
  ProdutosController.atualizarEstoque
);

// GET /api/produtos/grupo/:grupo_id - Buscar produtos por grupo
router.get('/grupo/:grupo_id',
  checkPermission('visualizar'),
  ProdutosController.buscarPorGrupo
);

// GET /api/produtos/fornecedor/:fornecedor_id - Buscar produtos por fornecedor
router.get('/fornecedor/:fornecedor_id',
  checkPermission('visualizar'),
  ProdutosController.buscarPorFornecedor
);

module.exports = router; 
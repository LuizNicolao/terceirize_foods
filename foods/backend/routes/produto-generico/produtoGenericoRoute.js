/**
 * Rotas para Produto Genérico
 * Implementa endpoints RESTful para CRUD de produtos genéricos
 */

const express = require('express');
const router = express.Router();

// Middlewares
const { checkPermission } = require('../../middleware/auth');
const { auditMiddleware, AUDIT_ACTIONS } = require('../../utils/audit');

// Controllers
const ProdutoGenericoController = require('../../controllers/produto-generico');

// Validators
const { produtoGenericoValidations, commonValidations } = require('./produtoGenericoValidator');

// GET /api/produto-generico - Listar produtos genéricos
router.get('/', 
  checkPermission('listar'),
  commonValidations.pagination,
  ProdutoGenericoController.listarProdutosGenericos
);

// GET /api/produto-generico/:id - Buscar produto genérico por ID
router.get('/:id', 
  checkPermission('visualizar'),
  commonValidations.id,
  ProdutoGenericoController.buscarProdutoGenericoPorId
);

// POST /api/produto-generico - Criar novo produto genérico
router.post('/', 
  checkPermission('criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'produto_generico'),
  produtoGenericoValidations.create,
  ProdutoGenericoController.criarProdutoGenerico
);

// PUT /api/produto-generico/:id - Atualizar produto genérico
router.put('/:id', 
  checkPermission('atualizar'),
  auditMiddleware(AUDIT_ACTIONS.UPDATE, 'produto_generico'),
  produtoGenericoValidations.update,
  ProdutoGenericoController.atualizarProdutoGenerico
);

// DELETE /api/produto-generico/:id - Excluir produto genérico
router.delete('/:id', 
  checkPermission('excluir'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'produto_generico'),
  commonValidations.id,
  ProdutoGenericoController.excluirProdutoGenerico
);

// GET /api/produto-generico/buscar/codigo/:codigo - Buscar por código
router.get('/buscar/codigo/:codigo', 
  checkPermission('listar'),
  ProdutoGenericoController.buscarProdutoGenericoPorCodigo
);

// GET /api/produto-generico/buscar/similar - Busca por similaridade
router.get('/buscar/similar', 
  checkPermission('listar'),
  ProdutoGenericoController.buscarProdutosGenericosSimilares
);

// GET /api/produto-generico/ativos - Listar produtos genéricos ativos
router.get('/ativos', 
  checkPermission('listar'),
  ProdutoGenericoController.buscarProdutosGenericosAtivos
);

// GET /api/produto-generico/grupo/:grupo_id - Buscar por grupo
router.get('/grupo/:grupo_id', 
  checkPermission('listar'),
  ProdutoGenericoController.buscarProdutosGenericosPorGrupo
);

// GET /api/produto-generico/subgrupo/:subgrupo_id - Buscar por subgrupo
router.get('/subgrupo/:subgrupo_id', 
  checkPermission('listar'),
  ProdutoGenericoController.buscarProdutosGenericosPorSubgrupo
);

// GET /api/produto-generico/classe/:classe_id - Buscar por classe
router.get('/classe/:classe_id', 
  checkPermission('listar'),
  ProdutoGenericoController.buscarProdutosGenericosPorClasse
);

// GET /api/produto-generico/produto-origem/:produto_origem_id - Buscar por produto origem
router.get('/produto-origem/:produto_origem_id', 
  checkPermission('listar'),
  ProdutoGenericoController.buscarProdutosGenericosPorProdutoOrigem
);

// GET /api/produto-generico/padrao - Listar produtos padrão
router.get('/padrao', 
  checkPermission('listar'),
  ProdutoGenericoController.buscarProdutosGenericosPadrao
);

module.exports = router;

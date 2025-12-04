/**
 * Rotas para Produto Genérico
 * Implementa endpoints RESTful para CRUD de produtos genéricos
 */

const express = require('express');
const { authenticateToken, checkScreenPermission } = require('../../middleware/auth');
const { produtoGenericoValidations, commonValidations } = require('./produtoGenericoValidator');
const { paginationMiddleware } = require('../../middleware/pagination');
const { hateoasMiddleware } = require('../../middleware/hateoas');
const { auditMiddleware, AUDIT_ACTIONS } = require('../../utils/audit');
const ProdutoGenericoController = require('../../controllers/produto-generico');

const router = express.Router();

// Aplicar middlewares globais
router.use(authenticateToken);
router.use(paginationMiddleware);
router.use(hateoasMiddleware('produto-generico'));



// GET /api/produto-generico - Listar produtos genéricos
router.get('/', 
  checkScreenPermission('produto_generico', 'visualizar'),
  commonValidations.search,
  commonValidations.pagination,
  ProdutoGenericoController.listarProdutosGenericos
);

// GET /api/produto-generico/proximo-codigo - Obter próximo código disponível
router.get('/proximo-codigo',
  checkScreenPermission('produto_generico', 'visualizar'),
  ProdutoGenericoController.obterProximoCodigo
);

// GET /api/produto-generico/:id - Buscar produto genérico por ID
router.get('/:id', 
  checkScreenPermission('produto_generico', 'visualizar'),
  commonValidations.id,
  ProdutoGenericoController.buscarProdutoGenericoPorId
);

// POST /api/produto-generico - Criar novo produto genérico
router.post('/', 
  checkScreenPermission('produto_generico', 'criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'produto_generico'),
  produtoGenericoValidations.create,
  ProdutoGenericoController.criarProdutoGenerico
);

// PUT /api/produto-generico/:id - Atualizar produto genérico
router.put('/:id', 
  checkScreenPermission('produto_generico', 'editar'),
  auditMiddleware(AUDIT_ACTIONS.UPDATE, 'produto_generico'),
  produtoGenericoValidations.update,
  ProdutoGenericoController.atualizarProdutoGenerico
);

// DELETE /api/produto-generico/:id - Excluir produto genérico
router.delete('/:id', 
  checkScreenPermission('produto_generico', 'excluir'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'produto_generico'),
  commonValidations.id,
  ProdutoGenericoController.excluirProdutoGenerico
);

// GET /api/produto-generico/buscar/codigo/:codigo - Buscar por código
router.get('/buscar/codigo/:codigo', 
  checkScreenPermission('produto_generico', 'visualizar'),
  ProdutoGenericoController.buscarProdutoGenericoPorCodigo
);

// GET /api/produto-generico/buscar/similar - Busca por similaridade
router.get('/buscar/similar', 
  checkScreenPermission('produto_generico', 'visualizar'),
  ProdutoGenericoController.buscarProdutosGenericosSimilares
);

// GET /api/produto-generico/ativos - Listar produtos genéricos ativos
router.get('/ativos', 
  checkScreenPermission('produto_generico', 'visualizar'),
  ProdutoGenericoController.buscarProdutosGenericosAtivos
);

// GET /api/produto-generico/grupo/:grupo_id - Buscar por grupo
router.get('/grupo/:grupo_id', 
  checkScreenPermission('produto_generico', 'visualizar'),
  ProdutoGenericoController.buscarProdutosGenericosPorGrupo
);

// GET /api/produto-generico/subgrupo/:subgrupo_id - Buscar por subgrupo
router.get('/subgrupo/:subgrupo_id', 
  checkScreenPermission('produto_generico', 'visualizar'),
  ProdutoGenericoController.buscarProdutosGenericosPorSubgrupo
);

// GET /api/produto-generico/classe/:classe_id - Buscar por classe
router.get('/classe/:classe_id', 
  checkScreenPermission('produto_generico', 'visualizar'),
  ProdutoGenericoController.buscarProdutosGenericosPorClasse
);

// GET /api/produto-generico/produto-origem/:produto_origem_id - Buscar por produto origem
router.get('/produto-origem/:produto_origem_id', 
  checkScreenPermission('produto_generico', 'visualizar'),
  ProdutoGenericoController.buscarProdutosGenericosPorProdutoOrigem
);

// GET /api/produto-generico/padrao - Listar produtos padrão
router.get('/padrao', 
  checkScreenPermission('produto_generico', 'visualizar'),
  ProdutoGenericoController.buscarProdutosGenericosPadrao
);

router.get('/exportar/xlsx', checkScreenPermission('produto_generico', 'visualizar'), ProdutoGenericoController.exportarXLSX);
router.get('/exportar/pdf', checkScreenPermission('produto_generico', 'visualizar'), ProdutoGenericoController.exportarPDF);

module.exports = router;

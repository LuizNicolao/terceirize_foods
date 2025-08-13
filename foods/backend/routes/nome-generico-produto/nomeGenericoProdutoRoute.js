/**
 * Rotas de Nomes Genéricos de Produtos
 * Implementa padrões RESTful com HATEOAS, paginação e validação
 */

const express = require('express');
const { authenticateToken, checkPermission } = require('../../middleware/auth');
const { nomeGenericoProdutoValidations, nomeGenericoProdutoAtualizacaoValidations } = require('./nomeGenericoProdutoValidator');
const { paginationMiddleware } = require('../../middleware/pagination');
const { hateoasMiddleware } = require('../../middleware/hateoas');
const { auditMiddleware, AUDIT_ACTIONS } = require('../../utils/audit');
const NomeGenericoProdutoController = require('../../controllers/nomeGenericoProdutoController');

const router = express.Router();

// Aplicar middlewares globais
router.use(authenticateToken);
router.use(paginationMiddleware);
router.use(hateoasMiddleware('nome-generico-produto'));

// GET /api/nome-generico-produto - Listar nomes genéricos com paginação e busca
router.get('/', 
  checkPermission('visualizar'),
  NomeGenericoProdutoController.listarNomesGenericos
);

// GET /api/nome-generico-produto/:id - Buscar nome genérico por ID
router.get('/:id', 
  checkPermission('visualizar'),
  NomeGenericoProdutoController.buscarNomeGenericoPorId
);

// POST /api/nome-generico-produto - Criar novo nome genérico
router.post('/', 
  checkPermission('criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'nome-generico-produto'),
  nomeGenericoProdutoValidations,
  NomeGenericoProdutoController.criarNomeGenerico
);

// PUT /api/nome-generico-produto/:id - Atualizar nome genérico
router.put('/:id', 
  checkPermission('editar'),
  auditMiddleware(AUDIT_ACTIONS.UPDATE, 'nome-generico-produto'),
  nomeGenericoProdutoAtualizacaoValidations,
  NomeGenericoProdutoController.atualizarNomeGenerico
);

// DELETE /api/nome-generico-produto/:id - Excluir nome genérico (soft delete)
router.delete('/:id', 
  checkPermission('excluir'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'nome-generico-produto'),
  NomeGenericoProdutoController.excluirNomeGenerico
);

// GET /api/nome-generico-produto/ativos/listar - Buscar nomes genéricos ativos
router.get('/ativos/listar',
  checkPermission('visualizar'),
  NomeGenericoProdutoController.buscarNomesGenericosAtivos
);

// GET /api/nome-generico-produto/grupo/:grupoId - Buscar nomes genéricos por grupo
router.get('/grupo/:grupoId',
  checkPermission('visualizar'),
  NomeGenericoProdutoController.buscarNomesGenericosPorGrupo
);

// GET /api/nome-generico-produto/subgrupo/:subgrupoId - Buscar nomes genéricos por subgrupo
router.get('/subgrupo/:subgrupoId',
  checkPermission('visualizar'),
  NomeGenericoProdutoController.buscarNomesGenericosPorSubgrupo
);

// GET /api/nome-generico-produto/classe/:classeId - Buscar nomes genéricos por classe
router.get('/classe/:classeId',
  checkPermission('visualizar'),
  NomeGenericoProdutoController.buscarNomesGenericosPorClasse
);

// GET /api/nome-generico-produto/estatisticas - Buscar estatísticas
router.get('/estatisticas',
  checkPermission('visualizar'),
  NomeGenericoProdutoController.buscarEstatisticasNomesGenericos
);

// GET /api/nome-generico-produto/:id/produtos - Buscar produtos de um nome genérico
router.get('/:id/produtos',
  checkPermission('visualizar'),
  NomeGenericoProdutoController.buscarProdutosNomeGenerico
);

module.exports = router;

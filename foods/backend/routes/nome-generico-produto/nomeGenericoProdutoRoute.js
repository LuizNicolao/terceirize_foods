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
const NomeGenericoProdutoController = require('../../controllers/nome-generico-produto');

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

// GET /api/nome-generico-produto/ativos - Buscar nomes genéricos ativos
router.get('/ativos',
  checkPermission('visualizar'),
  NomeGenericoProdutoController.buscarNomesGenericosAtivos
);

// GET /api/nome-generico-produto/estatisticas - Buscar estatísticas
router.get('/estatisticas',
  checkPermission('visualizar'),
  NomeGenericoProdutoController.buscarEstatisticas
);

// GET /api/nome-generico-produto/grupo/:grupo_id - Buscar nomes genéricos por grupo
router.get('/grupo/:grupo_id',
  checkPermission('visualizar'),
  NomeGenericoProdutoController.buscarNomesGenericosPorGrupo
);

// GET /api/nome-generico-produto/subgrupo/:subgrupo_id - Buscar nomes genéricos por subgrupo
router.get('/subgrupo/:subgrupo_id',
  checkPermission('visualizar'),
  NomeGenericoProdutoController.buscarNomesGenericosPorSubgrupo
);

// GET /api/nome-generico-produto/classe/:classe_id - Buscar nomes genéricos por classe
router.get('/classe/:classe_id',
  checkPermission('visualizar'),
  NomeGenericoProdutoController.buscarNomesGenericosPorClasse
);

// GET /api/nome-generico-produto/:id/produtos - Buscar produtos de um nome genérico
// Rota desabilitada - funcionalidade não implementada no banco de dados
// router.get('/:id/produtos',
//   checkPermission('visualizar'),
//   NomeGenericoProdutoController.buscarProdutosNomeGenerico
// );

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

module.exports = router;

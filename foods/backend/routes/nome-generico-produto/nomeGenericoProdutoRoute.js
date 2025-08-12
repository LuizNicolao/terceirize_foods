/**
 * Rotas de Nomes Genéricos de Produto
 * Implementa padrões RESTful com HATEOAS, paginação e validação
 */

const express = require('express');
const { authenticateToken, checkPermission } = require('../../middleware/auth');
const { nomeGenericoProdutoValidations, commonValidations } = require('./nomeGenericoProdutoValidator');
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
  commonValidations.search,
  commonValidations.pagination,
  NomeGenericoProdutoController.listarNomesGenericos
);

// GET /api/nome-generico-produto/ativos - Buscar nomes genéricos ativos
router.get('/ativos',
  checkPermission('visualizar'),
  NomeGenericoProdutoController.buscarNomesGenericosAtivos
);

// GET /api/nome-generico-produto/grupo/:grupoId - Buscar por grupo
router.get('/grupo/:grupoId',
  checkPermission('visualizar'),
  commonValidations.id,
  NomeGenericoProdutoController.buscarNomesGenericosPorGrupo
);

// GET /api/nome-generico-produto/subgrupo/:subgrupoId - Buscar por subgrupo
router.get('/subgrupo/:subgrupoId',
  checkPermission('visualizar'),
  commonValidations.id,
  NomeGenericoProdutoController.buscarNomesGenericosPorSubgrupo
);

// GET /api/nome-generico-produto/classe/:classeId - Buscar por classe
router.get('/classe/:classeId',
  checkPermission('visualizar'),
  commonValidations.id,
  NomeGenericoProdutoController.buscarNomesGenericosPorClasse
);

// GET /api/nome-generico-produto/:id - Buscar nome genérico por ID
router.get('/:id', 
  checkPermission('visualizar'),
  commonValidations.id,
  NomeGenericoProdutoController.buscarNomeGenericoPorId
);

// POST /api/nome-generico-produto - Criar novo nome genérico
router.post('/', 
  checkPermission('criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'nome-generico-produto'),
  nomeGenericoProdutoValidations.create,
  NomeGenericoProdutoController.criarNomeGenerico
);

// PUT /api/nome-generico-produto/:id - Atualizar nome genérico
router.put('/:id', 
  checkPermission('editar'),
  auditMiddleware(AUDIT_ACTIONS.UPDATE, 'nome-generico-produto'),
  nomeGenericoProdutoValidations.update,
  NomeGenericoProdutoController.atualizarNomeGenerico
);

// DELETE /api/nome-generico-produto/:id - Excluir nome genérico (soft delete)
router.delete('/:id', 
  checkPermission('excluir'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'nome-generico-produto'),
  commonValidations.id,
  NomeGenericoProdutoController.excluirNomeGenerico
);

module.exports = router;

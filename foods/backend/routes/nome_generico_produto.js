const express = require('express');
const { authenticateToken, checkPermission } = require('../middleware/auth');
const { auditMiddleware, auditChangesMiddleware, AUDIT_ACTIONS } = require('../utils/audit');
const { nomeGenericoProdutoValidations, nomeGenericoProdutoAtualizacaoValidations, handleValidationErrors } = require('../middleware/validation');
const { paginationMiddleware } = require('../middleware/pagination');
const { hateoasMiddleware } = require('../middleware/hateoas');
const nomeGenericoProdutoController = require('../controllers/nomeGenericoProdutoController');

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// ===== ROTAS PRINCIPAIS DE NOMES GENÉRICOS =====

// Listar nomes genéricos com paginação, busca e filtros
router.get('/', 
  checkPermission('visualizar'),
  paginationMiddleware,
  nomeGenericoProdutoController.listarNomesGenericos,
  hateoasMiddleware
);

// ===== ROTAS ESPECÍFICAS =====

// Buscar nomes genéricos ativos
router.get('/ativos/listar', 
  checkPermission('visualizar'),
  nomeGenericoProdutoController.buscarNomesGenericosAtivos,
  hateoasMiddleware
);

// Buscar nomes genéricos por grupo
router.get('/grupo/:grupoId', 
  checkPermission('visualizar'),
  nomeGenericoProdutoController.buscarNomesGenericosPorGrupo,
  hateoasMiddleware
);

// Buscar nomes genéricos por subgrupo
router.get('/subgrupo/:subgrupoId', 
  checkPermission('visualizar'),
  nomeGenericoProdutoController.buscarNomesGenericosPorSubgrupo,
  hateoasMiddleware
);

// Buscar nomes genéricos por classe
router.get('/classe/:classeId', 
  checkPermission('visualizar'),
  nomeGenericoProdutoController.buscarNomesGenericosPorClasse,
  hateoasMiddleware
);

// Buscar estatísticas dos nomes genéricos
router.get('/estatisticas', 
  checkPermission('visualizar'),
  nomeGenericoProdutoController.buscarEstatisticasNomesGenericos,
  hateoasMiddleware
);

// Buscar produtos de um nome genérico
router.get('/:id/produtos', 
  checkPermission('visualizar'),
  nomeGenericoProdutoController.buscarProdutosNomeGenerico,
  hateoasMiddleware
);

// ===== ROTAS CRUD PRINCIPAIS =====

// Buscar nome genérico por ID
router.get('/:id', 
  checkPermission('visualizar'),
  nomeGenericoProdutoController.buscarNomeGenericoPorId,
  hateoasMiddleware
);

// Criar nome genérico
router.post('/', [
  checkPermission('criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'nome_generico_produto'),
  nomeGenericoProdutoValidations,
  handleValidationErrors
], nomeGenericoProdutoController.criarNomeGenerico);

// Atualizar nome genérico
router.put('/:id', [
  checkPermission('editar'),
  auditChangesMiddleware(AUDIT_ACTIONS.UPDATE, 'nome_generico_produto'),
  nomeGenericoProdutoAtualizacaoValidations,
  handleValidationErrors
], nomeGenericoProdutoController.atualizarNomeGenerico);

// Excluir nome genérico
router.delete('/:id', [
  checkPermission('excluir'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'nome_generico_produto')
], nomeGenericoProdutoController.excluirNomeGenerico);

module.exports = router; 
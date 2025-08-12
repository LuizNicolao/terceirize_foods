const express = require('express');
const router = express.Router();
const NomeGenericoProdutoController = require('../../controllers/nomeGenericoProdutoController');
const { checkPermission } = require('../../middleware/auth');
const { paginationMiddleware } = require('../../middleware/pagination');
const { hateoasMiddleware } = require('../../middleware/hateoas');
const { responseHandler } = require('../../middleware/responseHandler');
const { auditMiddleware, auditChangesMiddleware } = require('../../utils/audit');
const { validate } = require('../../middleware/validation');
const nomeGenericoProdutoValidations = require('./nomeGenericoProdutoValidator');

// Middleware de auditoria para todas as rotas
router.use(auditMiddleware);

// Rotas específicas primeiro
router.get('/ativos', 
  checkPermission('nome_generico_produto', 'pode_visualizar'),
  paginationMiddleware,
  hateoasMiddleware,
  responseHandler,
  NomeGenericoProdutoController.buscarNomesGenericosAtivos
);

router.get('/grupo/:grupo_id',
  checkPermission('nome_generico_produto', 'pode_visualizar'),
  paginationMiddleware,
  hateoasMiddleware,
  responseHandler,
  NomeGenericoProdutoController.buscarNomesGenericosPorGrupo
);

router.get('/subgrupo/:subgrupo_id',
  checkPermission('nome_generico_produto', 'pode_visualizar'),
  paginationMiddleware,
  hateoasMiddleware,
  responseHandler,
  NomeGenericoProdutoController.buscarNomesGenericosPorSubgrupo
);

router.get('/classe/:classe_id',
  checkPermission('nome_generico_produto', 'pode_visualizar'),
  paginationMiddleware,
  hateoasMiddleware,
  responseHandler,
  NomeGenericoProdutoController.buscarNomesGenericosPorClasse
);

// Rotas CRUD padrão
router.get('/',
  checkPermission('nome_generico_produto', 'pode_visualizar'),
  paginationMiddleware,
  hateoasMiddleware,
  responseHandler,
  NomeGenericoProdutoController.listarNomesGenericos
);

router.get('/:id',
  checkPermission('nome_generico_produto', 'pode_visualizar'),
  hateoasMiddleware,
  responseHandler,
  NomeGenericoProdutoController.buscarNomeGenericoPorId 
);

router.post('/',
  checkPermission('nome_generico_produto', 'pode_criar'),
  validate(nomeGenericoProdutoValidations.criar),
  auditChangesMiddleware,
  hateoasMiddleware,
  responseHandler,
  NomeGenericoProdutoController.criarNomeGenerico
);

router.put('/:id',
  checkPermission('nome_generico_produto', 'pode_editar'),
  validate(nomeGenericoProdutoValidations.atualizar),
  auditChangesMiddleware,
  hateoasMiddleware,
  responseHandler,
  NomeGenericoProdutoController.atualizarNomeGenerico
);

router.delete('/:id',
  checkPermission('nome_generico_produto', 'pode_excluir'),
  auditChangesMiddleware,
  hateoasMiddleware,
  responseHandler,
  NomeGenericoProdutoController.excluirNomeGenerico
);

module.exports = router;

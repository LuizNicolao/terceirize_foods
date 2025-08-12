const express = require('express');
const router = express.Router();
const nomeGenericoProdutoController = require('../../controllers/nomeGenericoProdutoController');
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
  nomeGenericoProdutoController.buscarAtivos
);

router.get('/grupo/:grupo_id',
  checkPermission('nome_generico_produto', 'pode_visualizar'),
  paginationMiddleware,
  hateoasMiddleware,
  responseHandler,
  nomeGenericoProdutoController.buscarPorGrupo
);

router.get('/subgrupo/:subgrupo_id',
  checkPermission('nome_generico_produto', 'pode_visualizar'),
  paginationMiddleware,
  hateoasMiddleware,
  responseHandler,
  nomeGenericoProdutoController.buscarPorSubgrupo
);

router.get('/classe/:classe_id',
  checkPermission('nome_generico_produto', 'pode_visualizar'),
  paginationMiddleware,
  hateoasMiddleware,
  responseHandler,
  nomeGenericoProdutoController.buscarPorClasse
);

// Rotas CRUD padrão
router.get('/',
  checkPermission('nome_generico_produto', 'pode_visualizar'),
  paginationMiddleware,
  hateoasMiddleware,
  responseHandler,
  nomeGenericoProdutoController.listar
);

router.get('/:id',
  checkPermission('nome_generico_produto', 'pode_visualizar'),
  hateoasMiddleware,
  responseHandler,
  nomeGenericoProdutoController.buscarPorId
);

router.post('/',
  checkPermission('nome_generico_produto', 'pode_criar'),
  validate(nomeGenericoProdutoValidations.criar),
  auditChangesMiddleware,
  hateoasMiddleware,
  responseHandler,
  nomeGenericoProdutoController.criar
);

router.put('/:id',
  checkPermission('nome_generico_produto', 'pode_editar'),
  validate(nomeGenericoProdutoValidations.atualizar),
  auditChangesMiddleware,
  hateoasMiddleware,
  responseHandler,
  nomeGenericoProdutoController.atualizar
);

router.delete('/:id',
  checkPermission('nome_generico_produto', 'pode_excluir'),
  auditChangesMiddleware,
  hateoasMiddleware,
  responseHandler,
  nomeGenericoProdutoController.excluir
);

module.exports = router;

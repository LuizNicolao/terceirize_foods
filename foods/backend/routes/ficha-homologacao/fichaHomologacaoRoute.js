/**
 * Rotas para Ficha Homologação
 * Implementa endpoints RESTful para CRUD de fichas de homologação
 */

const express = require('express');
const { authenticateToken, checkPermission, checkScreenPermission } = require('../../middleware/auth');
const { fichaHomologacaoValidations, commonValidations } = require('./fichaHomologacaoValidator');
const { paginationMiddleware } = require('../../middleware/pagination');
const { hateoasMiddleware } = require('../../middleware/hateoas');
const { auditMiddleware, AUDIT_ACTIONS } = require('../../utils/audit');
const FichaHomologacaoController = require('../../controllers/ficha-homologacao');

const router = express.Router();

// Aplicar middlewares globais
router.use(authenticateToken);
router.use(paginationMiddleware);
router.use(hateoasMiddleware('ficha-homologacao'));

// GET /api/ficha-homologacao - Listar fichas de homologação
router.get('/', 
  checkPermission('visualizar'),
  commonValidations.search,
  commonValidations.pagination,
  FichaHomologacaoController.listarFichasHomologacao
);

// GET /api/ficha-homologacao/:id - Buscar ficha de homologação por ID
router.get('/:id', 
  checkPermission('visualizar'),
  commonValidations.id,
  FichaHomologacaoController.buscarFichaHomologacaoPorId
);

// POST /api/ficha-homologacao - Criar nova ficha de homologação
router.post('/', 
  checkPermission('criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'ficha_homologacao'),
  fichaHomologacaoValidations.create,
  FichaHomologacaoController.criarFichaHomologacao
);

// PUT /api/ficha-homologacao/:id - Atualizar ficha de homologação
router.put('/:id', 
  checkPermission('editar'),
  auditMiddleware(AUDIT_ACTIONS.UPDATE, 'ficha_homologacao'),
  fichaHomologacaoValidations.update,
  FichaHomologacaoController.atualizarFichaHomologacao
);

// DELETE /api/ficha-homologacao/:id - Excluir ficha de homologação
router.delete('/:id', 
  checkPermission('excluir'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'ficha_homologacao'),
  commonValidations.id,
  FichaHomologacaoController.excluirFichaHomologacao
);

// GET /api/ficha-homologacao/ativos - Listar fichas de homologação ativas
router.get('/ativos', 
  checkPermission('visualizar'),
  FichaHomologacaoController.buscarFichasHomologacaoAtivas
);

// GET /api/ficha-homologacao/tipo/:tipo - Buscar por tipo
router.get('/tipo/:tipo', 
  checkPermission('visualizar'),
  FichaHomologacaoController.buscarFichasHomologacaoPorTipo
);

// GET /api/ficha-homologacao/produto-generico/:produto_generico_id - Buscar por produto genérico
router.get('/produto-generico/:produto_generico_id', 
  checkPermission('visualizar'),
  FichaHomologacaoController.buscarFichasHomologacaoPorNomeGenerico
);

// GET /api/ficha-homologacao/fornecedor/:fornecedor_id - Buscar por fornecedor
router.get('/fornecedor/:fornecedor_id', 
  checkPermission('visualizar'),
  FichaHomologacaoController.buscarFichasHomologacaoPorFornecedor
);

// GET /api/ficha-homologacao/avaliador/:avaliador_id - Buscar por avaliador
router.get('/avaliador/:avaliador_id', 
  checkPermission('visualizar'),
  FichaHomologacaoController.buscarFichasHomologacaoPorAvaliador
);

// GET /api/ficha-homologacao/exportar/xlsx - Exportar para XLSX
router.get('/exportar/xlsx', 
  checkScreenPermission('ficha_homologacao', 'visualizar'), 
  FichaHomologacaoController.exportarXLSX
);

// GET /api/ficha-homologacao/exportar/pdf - Exportar para PDF
router.get('/exportar/pdf', 
  checkScreenPermission('ficha_homologacao', 'visualizar'), 
  FichaHomologacaoController.exportarPDF
);

module.exports = router;


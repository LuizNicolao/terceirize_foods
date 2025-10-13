/**
 * Rotas de Subgrupos
 * Implementa padrões RESTful com HATEOAS, paginação e validação
 */

const express = require('express');
const { authenticateToken, checkPermission, checkScreenPermission } = require('../../middleware/auth');
const { subgrupoValidations, commonValidations } = require('./subgrupoValidator');
const { paginationMiddleware } = require('../../middleware/pagination');
const { hateoasMiddleware } = require('../../middleware/hateoas');
const { auditMiddleware, AUDIT_ACTIONS } = require('../../utils/audit');
const SubgruposController = require('../../controllers/subgrupos');

const router = express.Router();

// Aplicar middlewares globais
router.use(authenticateToken);
router.use(paginationMiddleware);
router.use(hateoasMiddleware('subgrupos'));

// GET /api/subgrupos - Listar subgrupos com paginação e busca
router.get('/', 
  checkPermission('visualizar'),
  commonValidations.search,
  commonValidations.pagination,
  SubgruposController.listarSubgrupos
);

// GET /api/subgrupos/ativos - Buscar subgrupos ativos
router.get('/ativos',
  checkPermission('visualizar'),
  SubgruposController.buscarSubgruposAtivos
);

// GET /api/subgrupos/estatisticas - Buscar estatísticas de subgrupos
router.get('/estatisticas',
  checkPermission('visualizar'),
  SubgruposController.buscarEstatisticas
);

// GET /api/subgrupos/proximo-codigo - Obter próximo código disponível
router.get('/proximo-codigo',
  checkPermission('visualizar'),
  SubgruposController.obterProximoCodigo
);

// GET /api/subgrupos/codigo/:codigo - Buscar subgrupo por código
router.get('/codigo/:codigo',
  checkPermission('visualizar'),
  SubgruposController.buscarSubgruposPorCodigo
);

// GET /api/subgrupos/grupo/:grupo_id - Buscar subgrupos por grupo
router.get('/grupo/:grupo_id',
  checkPermission('visualizar'),
  commonValidations.id,
  SubgruposController.buscarSubgruposPorGrupo
);

// GET /api/subgrupos/:id - Buscar subgrupo por ID
router.get('/:id', 
  checkPermission('visualizar'),
  commonValidations.id,
  SubgruposController.buscarSubgrupoPorId
);

// POST /api/subgrupos - Criar novo subgrupo
router.post('/', 
  checkPermission('criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'subgrupos'),
  subgrupoValidations.create,
  SubgruposController.criarSubgrupo
);

// PUT /api/subgrupos/:id - Atualizar subgrupo
router.put('/:id', 
  checkPermission('editar'),
  auditMiddleware(AUDIT_ACTIONS.UPDATE, 'subgrupos'),
  subgrupoValidations.update,
  SubgruposController.atualizarSubgrupo
);

// DELETE /api/subgrupos/:id - Excluir subgrupo (soft delete)
router.delete('/:id', 
  checkPermission('excluir'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'subgrupos'),
  commonValidations.id,
  SubgruposController.excluirSubgrupo
);

router.get('/export/xlsx', checkScreenPermission('subgrupos', 'visualizar'), SubgruposController.exportarXLSX);
router.get('/export/pdf', checkScreenPermission('subgrupos', 'visualizar'), SubgruposController.exportarPDF);

module.exports = router;

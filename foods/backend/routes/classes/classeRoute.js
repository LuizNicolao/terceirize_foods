/**
 * Rotas de Classes
 * Implementa padrões RESTful com HATEOAS, paginação e validação
 */

const express = require('express');
const { authenticateToken, checkPermission, checkScreenPermission } = require('../../middleware/auth');
const { classeValidations, commonValidations } = require('./classeValidator');
const { paginationMiddleware } = require('../../middleware/pagination');
const { hateoasMiddleware } = require('../../middleware/hateoas');
const { auditMiddleware, AUDIT_ACTIONS } = require('../../utils/audit');
const ClassesController = require('../../controllers/classes');

const router = express.Router();

// Aplicar middlewares globais
router.use(authenticateToken);
router.use(paginationMiddleware);
router.use(hateoasMiddleware('classes'));

// GET /api/classes - Listar classes com paginação e busca
router.get('/', 
  checkPermission('visualizar'),
  commonValidations.search,
  commonValidations.pagination,
  ClassesController.listarClasses
);

// GET /api/classes/ativas - Buscar classes ativas
router.get('/ativas',
  checkPermission('visualizar'),
  ClassesController.buscarClassesAtivas
);

// GET /api/classes/estatisticas - Buscar estatísticas de classes
router.get('/estatisticas',
  checkPermission('visualizar'),
  ClassesController.buscarEstatisticas
);

// GET /api/classes/proximo-codigo - Obter próximo código disponível
router.get('/proximo-codigo',
  checkPermission('visualizar'),
  ClassesController.obterProximoCodigo
);

// GET /api/classes/codigo/:codigo - Buscar classe por código
router.get('/codigo/:codigo',
  checkPermission('visualizar'),
  ClassesController.buscarClassesPorCodigo
);

// GET /api/classes/subgrupo/:subgrupo_id - Buscar classes por subgrupo
router.get('/subgrupo/:subgrupo_id',
  checkPermission('visualizar'),
  commonValidations.id,
  ClassesController.buscarClassesPorSubgrupo
);

// GET /api/classes/:id - Buscar classe por ID
router.get('/:id', 
  checkPermission('visualizar'),
  commonValidations.id,
  ClassesController.buscarClassePorId
);

// POST /api/classes - Criar nova classe
router.post('/', 
  checkPermission('criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'classes'),
  classeValidations.create,
  ClassesController.criarClasse
);

// PUT /api/classes/:id - Atualizar classe
router.put('/:id', 
  checkPermission('editar'),
  auditMiddleware(AUDIT_ACTIONS.UPDATE, 'classes'),
  classeValidations.update,
  ClassesController.atualizarClasse
);

// DELETE /api/classes/:id - Excluir classe (soft delete)
router.delete('/:id', 
  checkPermission('excluir'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'classes'),
  commonValidations.id,
  ClassesController.excluirClasse
);

// ===== ROTAS DE EXPORTAÇÃO =====

// GET /api/classes/export/xlsx - Exportar para XLSX
router.get('/export/xlsx',
  checkScreenPermission('classes', 'visualizar'),
  ClassesController.exportarXLSX
);

// GET /api/classes/export/pdf - Exportar para PDF
router.get('/export/pdf',
  checkScreenPermission('classes', 'visualizar'),
  ClassesController.exportarPDF
);

module.exports = router;

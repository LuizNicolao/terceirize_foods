/**
 * Rotas para Rotas Nutricionistas
 * Implementa padrões RESTful com HATEOAS, paginação e validação
 */

const express = require('express');
const { authenticateToken, checkPermission, checkScreenPermission } = require('../../middleware/auth');
const { paginationMiddleware } = require('../../middleware/pagination');
const { hateoasMiddleware } = require('../../middleware/hateoas');
const { auditMiddleware, AUDIT_ACTIONS } = require('../../utils/audit');
const { commonValidations, rotasNutricionistasValidations } = require('./rotasNutricionistasValidator');
const RotasNutricionistasController = require('../../controllers/rotasNutricionistas');

const router = express.Router();

// Aplicar middlewares globais
router.use(authenticateToken);
router.use(paginationMiddleware);
router.use(hateoasMiddleware('rotas-nutricionistas'));

// GET /api/rotas-nutricionistas - Listar todas as rotas nutricionistas
router.get('/', 
  checkScreenPermission('rotas_nutricionistas', 'visualizar'),
  commonValidations.search,
  commonValidations.pagination,
  rotasNutricionistasValidations.filtros,
  RotasNutricionistasController.listar
);

// GET /api/rotas-nutricionistas/export/xlsx - Exportar para XLSX
router.get('/export/xlsx',
  checkPermission('visualizar'),
  rotasNutricionistasValidations.exportar,
  RotasNutricionistasController.exportarXLSX
);

// GET /api/rotas-nutricionistas/export/pdf - Exportar para PDF
router.get('/export/pdf',
  checkPermission('visualizar'),
  rotasNutricionistasValidations.exportar,
  RotasNutricionistasController.exportarPDF
);

// GET /api/rotas-nutricionistas/ativas/listar - Buscar rotas nutricionistas ativas
router.get('/ativas/listar',
  checkPermission('visualizar'),
  RotasNutricionistasController.buscarRotasAtivas
);

// GET /api/rotas-nutricionistas/:id - Buscar rota nutricionista por ID
router.get('/:id', 
  checkScreenPermission('rotas_nutricionistas', 'visualizar'),
  commonValidations.id,
  RotasNutricionistasController.buscarPorId
);

// POST /api/rotas-nutricionistas - Criar nova rota nutricionista
router.post('/',
  checkPermission('criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'rotas-nutricionistas'),
  rotasNutricionistasValidations.criar,
  RotasNutricionistasController.criar
);

// PUT /api/rotas-nutricionistas/:id - Atualizar rota nutricionista existente
router.put('/:id',
  checkPermission('editar'),
  auditMiddleware(AUDIT_ACTIONS.UPDATE, 'rotas-nutricionistas'),
  commonValidations.id,
  rotasNutricionistasValidations.atualizar,
  RotasNutricionistasController.atualizar
);

// DELETE /api/rotas-nutricionistas/:id - Excluir rota nutricionista
router.delete('/:id',
  checkPermission('excluir'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'rotas-nutricionistas'),
  commonValidations.id,
  RotasNutricionistasController.excluir
);

module.exports = router;

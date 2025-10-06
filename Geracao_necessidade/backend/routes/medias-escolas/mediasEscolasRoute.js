/**
 * Rotas de Médias por Escolas
 * Implementa padrões RESTful com HATEOAS, paginação e validação
 */

const express = require('express');
const { authenticateToken } = require('../../middleware/auth');
const { canView, canCreate, canEdit, canDelete } = require('../../middleware/permissoes');
const { mediasEscolasValidations, commonValidations } = require('./mediasEscolasValidator');
const { paginationMiddleware } = require('../../middleware/pagination');
const { hateoasMiddleware } = require('../../middleware/hateoas');
const { auditMiddleware, AUDIT_ACTIONS } = require('../../utils/audit');
const MediasEscolasController = require('../../controllers/medias-escolas');

const router = express.Router();

// Aplicar middlewares globais
router.use(authenticateToken);
router.use(paginationMiddleware);
router.use(hateoasMiddleware('medias-escolas'));

// GET /api/medias-escolas - Listar médias com paginação e busca
router.get('/',
  canView('medias-escolas'),
  ...commonValidations.search,
  ...commonValidations.pagination,
  MediasEscolasController.listar
);

// GET /api/medias-escolas/escolas - Listar escolas do nutricionista
router.get('/escolas',
  canView('medias-escolas'),
  ...commonValidations.search,
  MediasEscolasController.listarEscolasNutricionista
);

// GET /api/medias-escolas/escola/:escola_id - Buscar médias por escola
router.get('/escola/:escola_id',
  canView('medias-escolas'),
  ...mediasEscolasValidations.escolaId,
  MediasEscolasController.buscarPorEscola
);

// GET /api/medias-escolas/:id - Buscar média por ID
router.get('/:id',
  canView('medias-escolas'),
  ...mediasEscolasValidations.id,
  MediasEscolasController.buscarPorId
);

// POST /api/medias-escolas - Criar nova média
router.post('/',
  canCreate('medias-escolas'),
  ...mediasEscolasValidations.create,
  auditMiddleware(AUDIT_ACTIONS.CREATE),
  MediasEscolasController.criar
);

// PUT /api/medias-escolas/:id - Atualizar média
router.put('/:id',
  canEdit('medias-escolas'),
  ...mediasEscolasValidations.id,
  ...mediasEscolasValidations.update,
  auditMiddleware(AUDIT_ACTIONS.UPDATE),
  MediasEscolasController.atualizar
);

// DELETE /api/medias-escolas/:id - Deletar média
router.delete('/:id',
  canDelete('medias-escolas'),
  ...mediasEscolasValidations.id,
  auditMiddleware(AUDIT_ACTIONS.DELETE),
  MediasEscolasController.deletar
);

// ===== ROTAS DE CÁLCULO =====

// POST /api/medias-escolas/calcular-medias - Calcular médias automaticamente
router.post('/calcular-medias',
  canCreate('medias-escolas'),
  auditMiddleware(AUDIT_ACTIONS.CREATE),
  MediasEscolasController.calcularMedias
);

// GET /api/medias-escolas/medias-periodo - Calcular médias por período
router.get('/medias-periodo',
  canView('medias-escolas'),
  ...commonValidations.dateRange,
  MediasEscolasController.calcularMediasPorPeriodo
);

// ===== ROTAS DE ESTATÍSTICAS =====

// GET /api/medias-escolas/stats/estatisticas - Obter estatísticas detalhadas
router.get('/stats/estatisticas',
  canView('medias-escolas'),
  ...commonValidations.search,
  ...commonValidations.dateRange,
  MediasEscolasController.obterEstatisticas
);

// GET /api/medias-escolas/stats/resumo - Obter resumo por período
router.get('/stats/resumo',
  canView('medias-escolas'),
  ...commonValidations.search,
  ...commonValidations.dateRange,
  MediasEscolasController.obterResumo
);

module.exports = router;

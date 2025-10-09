/**
 * Rotas para Períodos de Refeição
 * Implementa todas as rotas relacionadas a períodos de refeição
 */

const express = require('express');
const { authenticateToken, checkScreenPermission } = require('../../middleware/auth');
const { auditMiddleware } = require('../../utils/audit');
const { paginationMiddleware } = require('../../middleware/pagination');
const { hateoasMiddleware } = require('../../middleware/hateoas');
const { validateRequest } = require('../../middleware/validation');

const router = express.Router();

// Aplicar middlewares globais
router.use(authenticateToken);
router.use(paginationMiddleware);
router.use(hateoasMiddleware('periodos_refeicao'));

// Controllers
const periodosRefeicaoController = require('../../controllers/periodos-refeicao');

// Validators
const { 
  commonValidations, 
  periodosRefeicaoValidations, 
  filterValidations 
} = require('./periodosRefeicaoValidator');

// Constantes de auditoria
const AUDIT_ACTIONS = {
  CREATE: 'CREATE',
  READ: 'READ',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE'
};

// ===== ROTAS CRUD =====

// Listar períodos de refeição com paginação e filtros
router.get('/', 
  checkScreenPermission('periodos_refeicao', 'visualizar'),
  ...commonValidations.pagination,
  ...filterValidations.status,
  ...filterValidations.filial,
  ...commonValidations.search,
  periodosRefeicaoController.listar
);

// Buscar período de refeição por ID
router.get('/:id', 
  checkScreenPermission('periodos_refeicao', 'visualizar'),
  auditMiddleware(AUDIT_ACTIONS.READ, 'periodos_refeicao'),
  ...commonValidations.id,
  periodosRefeicaoController.buscarPorId
);

// Criar novo período de refeição
router.post('/', 
  checkScreenPermission('periodos_refeicao', 'criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'periodos_refeicao'),
  ...periodosRefeicaoValidations.create,
  periodosRefeicaoController.criar
);

// Atualizar período de refeição
router.put('/:id', 
  checkScreenPermission('periodos_refeicao', 'editar'),
  auditMiddleware(AUDIT_ACTIONS.UPDATE, 'periodos_refeicao'),
  ...commonValidations.id,
  ...periodosRefeicaoValidations.update,
  periodosRefeicaoController.atualizar
);

// Excluir período de refeição
router.delete('/:id', 
  checkScreenPermission('periodos_refeicao', 'excluir'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'periodos_refeicao'),
  ...commonValidations.id,
  periodosRefeicaoController.excluir
);

// ===== ROTAS DE BUSCA =====

// Listar períodos de refeição (método alternativo)
router.get('/listar/todos', 
  checkScreenPermission('periodos_refeicao', 'visualizar'),
  ...commonValidations.pagination,
  ...filterValidations.status,
  ...filterValidations.filial,
  ...commonValidations.search,
  periodosRefeicaoController.listarPeriodosRefeicao
);

// Buscar período de refeição por ID (método alternativo)
router.get('/buscar/:id', 
  checkScreenPermission('periodos_refeicao', 'visualizar'),
  ...commonValidations.id,
  periodosRefeicaoController.buscarPeriodoRefeicaoPorId
);

// Buscar períodos de refeição ativos
router.get('/ativas/listar', 
  checkScreenPermission('periodos_refeicao', 'visualizar'),
  ...filterValidations.filial,
  periodosRefeicaoController.buscarAtivos
);

// Buscar períodos de refeição por filial
router.get('/filial/:filialId', 
  checkScreenPermission('periodos_refeicao', 'visualizar'),
  ...periodosRefeicaoValidations.buscarPorFilial,
  periodosRefeicaoController.buscarPorFilial
);

// Buscar períodos de refeição disponíveis para uma unidade escolar
router.get('/unidade-escolar/:unidadeEscolarId/disponiveis', 
  checkScreenPermission('periodos_refeicao', 'visualizar'),
  ...periodosRefeicaoValidations.buscarDisponiveisParaUnidade,
  periodosRefeicaoController.buscarDisponiveisParaUnidade
);

// Buscar períodos de refeição por IDs específicos
router.post('/buscar-por-ids', 
  checkScreenPermission('periodos_refeicao', 'visualizar'),
  ...periodosRefeicaoValidations.buscarPorIds,
  periodosRefeicaoController.buscarPorIds
);

router.get('/export/xlsx', checkScreenPermission('periodos_refeicao', 'visualizar'), periodosRefeicaoController.exportarXLSX);
router.get('/export/pdf', checkScreenPermission('periodos_refeicao', 'visualizar'), periodosRefeicaoController.exportarPDF);

module.exports = router;

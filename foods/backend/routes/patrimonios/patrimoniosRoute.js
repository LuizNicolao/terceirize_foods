/**
 * Rotas de Patrimônios
 * Implementa padrões RESTful com HATEOAS, paginação e validação
 */

const express = require('express');
const { authenticateToken, checkPermission } = require('../../middleware/auth');
const { paginationMiddleware } = require('../../middleware/pagination');
const { hateoasMiddleware } = require('../../middleware/hateoas');
const { auditMiddleware, AUDIT_ACTIONS } = require('../../utils/audit');
const { commonValidations, patrimoniosValidations } = require('./patrimoniosValidator');
const PatrimoniosController = require('../../controllers/patrimonios');

const router = express.Router();

// Aplicar middlewares globais
router.use(authenticateToken);
router.use(paginationMiddleware);
router.use(hateoasMiddleware('patrimonios'));

// GET /api/patrimonios - Listar patrimônios com filtros e paginação
router.get('/', 
  checkPermission('visualizar'),
  commonValidations.search,
  commonValidations.pagination,
  patrimoniosValidations.filtros,
  PatrimoniosController.listarPatrimonios
);

// GET /api/patrimonios/:id - Obter patrimônio específico
router.get('/:id', 
  checkPermission('visualizar'),
  commonValidations.id,
  PatrimoniosController.obterPatrimonio
);

// POST /api/patrimonios - Criar novo patrimônio
router.post('/', 
  checkPermission('criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'patrimonios'),
  patrimoniosValidations.criarPatrimonio,
  PatrimoniosController.criarPatrimonio
);

// PUT /api/patrimonios/:id - Atualizar patrimônio
router.put('/:id', 
  checkPermission('editar'),
  auditMiddleware(AUDIT_ACTIONS.UPDATE, 'patrimonios'),
  patrimoniosValidations.atualizarPatrimonio,
  PatrimoniosController.atualizarPatrimonio
);

// DELETE /api/patrimonios/:id - Excluir patrimônio
router.delete('/:id', 
  checkPermission('excluir'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'patrimonios'),
  commonValidations.id,
  PatrimoniosController.excluirPatrimonio
);

// POST /api/patrimonios/:id/movimentar - Movimentar patrimônio
router.post('/:id/movimentar', 
  checkPermission('movimentar'),
  auditMiddleware(AUDIT_ACTIONS.UPDATE, 'patrimonios'),
  patrimoniosValidations.movimentarPatrimonio,
  PatrimoniosController.movimentarPatrimonio
);

// GET /api/patrimonios/:id/movimentacoes - Listar movimentações de um patrimônio
router.get('/:id/movimentacoes', 
  checkPermission('visualizar'),
  commonValidations.id,
  PatrimoniosController.listarMovimentacoesPatrimonio
);

// GET /api/patrimonios/escola/:escolaId - Listar patrimônios de uma escola
router.get('/escola/:escolaId', 
  checkPermission('visualizar'),
  commonValidations.pagination,
  PatrimoniosController.listarPatrimoniosEscola
);

// GET /api/patrimonios/produtos/equipamentos - Listar produtos que podem virar patrimônios
router.get('/produtos/equipamentos', 
  checkPermission('visualizar'),
  commonValidations.search,
  commonValidations.pagination,
  PatrimoniosController.listarProdutosEquipamentos
);

module.exports = router;

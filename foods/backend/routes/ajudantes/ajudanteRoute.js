const express = require('express');
const router = express.Router();
const ajudantesController = require('../../controllers/ajudantesController');
const { authenticateToken, checkPermission } = require('../../middleware/auth');
const { paginationMiddleware, hateoasMiddleware } = require('../../middleware');
const { auditMiddleware, AUDIT_ACTIONS } = require('../../utils/audit');
const { ajudanteValidator } = require('./ajudanteValidator');

// Middlewares globais
router.use(authenticateToken);
router.use(paginationMiddleware);
router.use(hateoasMiddleware('ajudantes'));

// Rotas
router.get('/', 
  checkPermission('ajudantes', 'visualizar'),
  ajudantesController.listarAjudantes
);

router.get('/estatisticas',
  checkPermission('ajudantes', 'visualizar'),
  ajudantesController.estatisticas
);

router.get('/:id',
  checkPermission('ajudantes', 'visualizar'),
  ajudanteValidator.buscar,
  ajudantesController.buscarAjudante
);

router.post('/',
  checkPermission('ajudantes', 'criar'),
  ajudanteValidator.criar,
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'ajudantes'),
  ajudantesController.criarAjudante
);

router.put('/:id',
  checkPermission('ajudantes', 'editar'),
  ajudanteValidator.atualizar,
  auditMiddleware(AUDIT_ACTIONS.UPDATE, 'ajudantes'),
  ajudantesController.atualizarAjudante
);

router.delete('/:id',
  checkPermission('ajudantes', 'excluir'),
  ajudanteValidator.excluir,
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'ajudantes'),
  ajudantesController.excluirAjudante
);

module.exports = router;

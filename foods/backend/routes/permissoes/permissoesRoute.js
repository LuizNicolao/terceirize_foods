const express = require('express');
const { authenticateToken, checkPermission } = require('../../middleware/auth');
const { paginationMiddleware } = require('../../middleware/pagination');
const { hateoasMiddleware } = require('../../middleware/hateoas');
const { auditMiddleware, auditChangesMiddleware, AUDIT_ACTIONS } = require('../../utils/audit');
const PermissoesController = require('../../controllers/permissoesController');

const router = express.Router();

// Aplicar middlewares globais
router.use(authenticateToken);
router.use(paginationMiddleware);
router.use(hateoasMiddleware);

// Rotas de usuários com permissões
router.get('/usuarios', 
  checkPermission('visualizar'), 
  PermissoesController.listarUsuarios
);

// Rotas de permissões de usuário
router.get('/usuario/:usuarioId', 
  checkPermission('visualizar'), 
  PermissoesController.buscarPermissoesUsuario
);

router.put('/usuario/:usuarioId', 
  [
    checkPermission('editar'),
    auditChangesMiddleware(AUDIT_ACTIONS.UPDATE, 'permissoes')
  ],
  PermissoesController.atualizarPermissoes
);

// Rotas de permissões padrão
router.get('/padrao/:tipoAcesso/:nivelAcesso', 
  checkPermission('visualizar'), 
  PermissoesController.obterPermissoesPadrao
);

// Rotas de telas
router.get('/telas', 
  checkPermission('visualizar'), 
  PermissoesController.listarTelas
);

module.exports = router;

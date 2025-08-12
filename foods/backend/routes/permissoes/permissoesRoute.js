const express = require('express');
const { authenticateToken, checkPermission, checkScreenPermission } = require('../../middleware/auth');
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
  checkScreenPermission('permissoes', 'visualizar'), 
  PermissoesController.listarUsuarios
);

// Rotas de permissões de usuário
router.get('/usuario/:usuarioId', 
  checkScreenPermission('permissoes', 'visualizar'), 
  PermissoesController.buscarPermissoesUsuario
);

router.put('/usuario/:usuarioId', 
  [
    checkScreenPermission('permissoes', 'editar'),
    auditChangesMiddleware(AUDIT_ACTIONS.UPDATE, 'permissoes')
  ],
  PermissoesController.atualizarPermissoes
);

// Rotas de permissões padrão
router.get('/padrao/:tipoAcesso/:nivelAcesso', 
  checkScreenPermission('permissoes', 'visualizar'), 
  PermissoesController.obterPermissoesPadrao
);

// Rotas de telas
router.get('/telas', 
  checkScreenPermission('permissoes', 'visualizar'), 
  PermissoesController.listarTelas
);

module.exports = router;

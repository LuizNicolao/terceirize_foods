/**
 * Rotas de Permissões
 * Implementa padrões RESTful com HATEOAS, paginação e validação
 */

const express = require('express');
const { authenticateToken, checkScreenPermission } = require('../../middleware/auth');
const { paginationMiddleware } = require('../../middleware/pagination');
const { hateoasMiddleware } = require('../../middleware/hateoas');
const { auditMiddleware, AUDIT_ACTIONS } = require('../../utils/audit');
const { permissoesLimiter } = require('../../middleware/rateLimiter');
const { createEntityValidationHandler } = require('../../middleware/validationHandler');
const { commonValidations, permissoesValidations } = require('./permissoesValidator');
const PermissoesController = require('../../controllers/permissoes');

const router = express.Router();

// Aplicar middlewares globais
router.use(permissoesLimiter);
router.use(authenticateToken);
router.use(paginationMiddleware);
router.use(hateoasMiddleware('permissoes'));

// GET /api/permissoes/usuarios - Listar usuários com contagem de permissões
router.get('/usuarios', 
  checkScreenPermission('permissoes', 'visualizar'),
  commonValidations.search,
  commonValidations.pagination,
  PermissoesController.listarUsuarios
);

// GET /api/permissoes/padrao/:tipoAcesso/:nivelAcesso - Obter permissões padrão
router.get('/padrao/:tipoAcesso/:nivelAcesso', 
  checkScreenPermission('permissoes', 'visualizar'),
  permissoesValidations.obterPermissoesPadrao,
  PermissoesController.obterPermissoesPadrao
);

// GET /api/permissoes/usuario/:usuarioId - Listar permissões de um usuário
router.get('/usuario/:usuarioId', 
  checkScreenPermission('permissoes', 'visualizar'),
  commonValidations.usuarioId,
  PermissoesController.listarPermissoesUsuario
);

// PUT /api/permissoes/usuario/:usuarioId - Atualizar permissões de um usuário
router.put('/usuario/:usuarioId', 
  checkScreenPermission('permissoes', 'editar'),
  auditMiddleware(AUDIT_ACTIONS.UPDATE, 'permissoes'),
  permissoesValidations.atualizarPermissoes,
  PermissoesController.atualizarPermissoes
);

// GET /api/permissoes/telas - Listar todas as telas disponíveis
router.get('/telas', 
  checkScreenPermission('permissoes', 'visualizar'),
  PermissoesController.listarTelas
);

// POST /api/permissoes/sincronizar - Sincronizar permissões de todos os usuários
router.post('/sincronizar', 
  checkScreenPermission('permissoes', 'editar'),
  auditMiddleware(AUDIT_ACTIONS.UPDATE, 'permissoes'),
  PermissoesController.sincronizarPermissoes
);

// GET /api/permissoes/tipos-acesso - Listar tipos de acesso disponíveis
router.get('/tipos-acesso', 
  checkScreenPermission('permissoes', 'visualizar'),
  PermissoesController.listarTiposAcesso
);

// GET /api/permissoes/niveis-acesso - Listar níveis de acesso disponíveis
router.get('/niveis-acesso', 
  checkScreenPermission('permissoes', 'visualizar'),
  PermissoesController.listarNiveisAcesso
);

module.exports = router;

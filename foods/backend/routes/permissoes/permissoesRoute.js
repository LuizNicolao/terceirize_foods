/**
 * Rotas de Permissões
 * Implementa padrões RESTful com HATEOAS, paginação e validação
 */

const express = require('express');
const { authenticateToken, checkPermission, checkScreenPermission } = require('../../middleware/auth');
const { paginationMiddleware } = require('../../middleware/pagination');
const { hateoasMiddleware } = require('../../middleware/hateoas');
const { auditMiddleware, AUDIT_ACTIONS } = require('../../utils/audit');
const { commonValidations, permissoesValidations } = require('./permissoesValidator');
const PermissoesController = require('../../controllers/permissoes');

const router = express.Router();

// Aplicar middlewares globais
router.use(authenticateToken);
router.use(paginationMiddleware);
router.use(hateoasMiddleware('permissoes'));

// GET /api/permissoes/usuarios - Listar usuários com contagem de permissões
router.get('/usuarios', 
  checkPermission('visualizar'),
  commonValidations.search,
  commonValidations.pagination,
  PermissoesController.listarUsuarios
);

// GET /api/permissoes/padrao/:tipoAcesso/:nivelAcesso - Obter permissões padrão
router.get('/padrao/:tipoAcesso/:nivelAcesso', 
  checkPermission('visualizar'),
  permissoesValidations.obterPermissoesPadrao,
  PermissoesController.obterPermissoesPadrao
);

// GET /api/permissoes/usuario/:usuarioId - Listar permissões de um usuário
router.get('/usuario/:usuarioId', 
  checkPermission('visualizar'),
  commonValidations.usuarioId,
  PermissoesController.listarPermissoesUsuario
);

// PUT /api/permissoes/usuario/:usuarioId - Atualizar permissões de um usuário
router.put('/usuario/:usuarioId', 
  checkPermission('editar'),
  auditMiddleware(AUDIT_ACTIONS.UPDATE, 'permissoes'),
  permissoesValidations.atualizarPermissoes,
  PermissoesController.atualizarPermissoes
);

// GET /api/permissoes/telas - Listar todas as telas disponíveis
router.get('/telas', 
  checkPermission('visualizar'),
  PermissoesController.listarTelas
);

// POST /api/permissoes/sincronizar - Sincronizar permissões de todos os usuários
router.post('/sincronizar', 
  checkPermission('editar'),
  auditMiddleware(AUDIT_ACTIONS.UPDATE, 'permissoes'),
  PermissoesController.sincronizarPermissoes
);

// GET /api/permissoes/tipos-acesso - Listar tipos de acesso disponíveis
router.get('/tipos-acesso', 
  checkPermission('visualizar'),
  PermissoesController.listarTiposAcesso
);

// GET /api/permissoes/niveis-acesso - Listar níveis de acesso disponíveis
router.get('/niveis-acesso', 
  checkPermission('visualizar'),
  PermissoesController.listarNiveisAcesso
);

router.get('/export/xlsx', checkScreenPermission('permissoes', 'visualizar'), PermissoesController.exportarXLSX);
router.get('/export/pdf', checkScreenPermission('permissoes', 'visualizar'), PermissoesController.exportarPDF);

module.exports = router;

/**
 * Rotas de Usuários
 * Implementa padrões RESTful com HATEOAS, paginação e validação
 */

const express = require('express');
const { authenticateToken, checkPermission } = require('../middleware/auth');
const { userValidations, commonValidations } = require('../middleware/validation');
const { paginationMiddleware } = require('../middleware/pagination');
const { hateoasMiddleware } = require('../middleware/hateoas');
const { auditMiddleware, AUDIT_ACTIONS } = require('../utils/audit');
const UsuariosController = require('../controllers/usuariosController');

const router = express.Router();

// Aplicar middlewares globais
router.use(authenticateToken);
router.use(paginationMiddleware);
router.use(hateoasMiddleware('usuarios'));

// GET /api/usuarios - Listar usuários com paginação e busca
router.get('/', 
  checkPermission('visualizar'),
  commonValidations.search,
  commonValidations.pagination,
  UsuariosController.listarUsuarios
);

// GET /api/usuarios/:id - Buscar usuário por ID
router.get('/:id', 
  checkPermission('visualizar'),
  commonValidations.id,
  UsuariosController.buscarUsuarioPorId
);

// POST /api/usuarios - Criar novo usuário
router.post('/', 
  checkPermission('criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'usuarios'),
  userValidations.create,
  UsuariosController.criarUsuario
);

// PUT /api/usuarios/:id - Atualizar usuário
router.put('/:id', 
  checkPermission('editar'),
  auditMiddleware(AUDIT_ACTIONS.UPDATE, 'usuarios'),
  userValidations.update,
  UsuariosController.atualizarUsuario
);

// DELETE /api/usuarios/:id - Excluir usuário (soft delete)
router.delete('/:id', 
  checkPermission('excluir'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'usuarios'),
  commonValidations.id,
  UsuariosController.excluirUsuario
);

// PUT /api/usuarios/:id/senha - Alterar senha
router.put('/:id/senha',
  commonValidations.id,
  UsuariosController.alterarSenha
);

// GET /api/usuarios/tipo/:tipo - Buscar usuários por tipo de acesso
router.get('/tipo/:tipo',
  checkPermission('visualizar'),
  UsuariosController.buscarPorTipoAcesso
);

module.exports = router; 
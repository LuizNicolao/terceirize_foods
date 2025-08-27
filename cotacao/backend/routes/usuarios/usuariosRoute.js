/**
 * Rotas de Usuários
 * Implementa padrões RESTful com HATEOAS, paginação e validação
 */

const express = require('express');
const { authenticateToken, checkPermission } = require('../../middleware/auth');
const { paginationMiddleware } = require('../../middleware/pagination');
const { hateoasMiddleware } = require('../../middleware/hateoas');
const { auditMiddleware, AUDIT_ACTIONS } = require('../../utils/audit');
const UsuariosController = require('../../controllers/usuarios/UsuariosController');
const { 
  usuariosValidation,
  usuarioValidation,
  createUsuarioValidation,
  updateUsuarioValidation
} = require('./usuariosValidator');

const router = express.Router();

// Aplicar middlewares globais
router.use(authenticateToken);
router.use(paginationMiddleware);
router.use(hateoasMiddleware('users'));

// GET /api/users - Listar usuários com paginação e busca
router.get('/', 
  checkPermission('visualizar'),
  usuariosValidation, 
  UsuariosController.getUsuarios
);

// GET /api/users/by-email/:email - Buscar usuário por email
router.get('/by-email/:email', 
  UsuariosController.getUsuarioByEmail
);

// GET /api/users/:id - Buscar usuário por ID
router.get('/:id', 
  checkPermission('visualizar'),
  usuarioValidation, 
  UsuariosController.getUsuario
);

// POST /api/users - Criar novo usuário
router.post('/', 
  checkPermission('criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'usuarios'),
  createUsuarioValidation, 
  UsuariosController.createUsuario
);

// PUT /api/users/:id - Atualizar usuário
router.put('/:id', 
  checkPermission('editar'),
  auditMiddleware(AUDIT_ACTIONS.UPDATE, 'usuarios'),
  updateUsuarioValidation, 
  UsuariosController.updateUsuario
);

// DELETE /api/users/:id - Excluir usuário (soft delete)
router.delete('/:id', 
  checkPermission('excluir'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'usuarios'),
  usuarioValidation, 
  UsuariosController.deleteUsuario
);

module.exports = router;

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const UsuariosController = require('../../controllers/UsuariosController');
const {
  validateCreateUsuario,
  validateUpdateUsuario,
  validateGetUsuario,
  validateDeleteUsuario,
  validateChangePassword,
  validateUpdatePermissions,
  validateToggleStatus
} = require('./usuariosValidator');

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token de acesso necessário' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Middleware de autorização para administradores
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'administrador') {
    return res.status(403).json({ message: 'Acesso negado. Apenas administradores.' });
  }
  next();
};

// Middleware de autorização para gestores e administradores
const requireManagerOrAdmin = (req, res, next) => {
  if (!['gestor', 'administrador'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Acesso negado. Apenas gestores e administradores.' });
  }
  next();
};

// Rotas de usuários
// GET /api/users - Listar todos os usuários
router.get('/', authenticateToken, requireManagerOrAdmin, UsuariosController.getUsuarios);

// GET /api/users/:id - Buscar usuário específico
router.get('/:id', authenticateToken, validateGetUsuario, UsuariosController.getUsuario);

// POST /api/users - Criar novo usuário
router.post('/', authenticateToken, requireAdmin, validateCreateUsuario, UsuariosController.createUsuario);

// PUT /api/users/:id - Atualizar usuário
router.put('/:id', authenticateToken, requireManagerOrAdmin, validateUpdateUsuario, UsuariosController.updateUsuario);

// DELETE /api/users/:id - Excluir usuário
router.delete('/:id', authenticateToken, requireAdmin, validateDeleteUsuario, UsuariosController.deleteUsuario);

// GET /api/users/:id/permissions - Buscar permissões do usuário
router.get('/:id/permissions', authenticateToken, validateGetUsuario, UsuariosController.getUsuarioPermissions);

// PUT /api/users/:id/permissions - Atualizar permissões do usuário
router.put('/:id/permissions', authenticateToken, requireAdmin, validateUpdatePermissions, UsuariosController.updateUsuarioPermissions);

// POST /api/users/:id/change-password - Alterar senha
router.post('/:id/change-password', authenticateToken, validateChangePassword, UsuariosController.changePassword);

// POST /api/users/:id/activate - Ativar usuário
router.post('/:id/activate', authenticateToken, requireManagerOrAdmin, validateToggleStatus, UsuariosController.activateUsuario);

// POST /api/users/:id/deactivate - Desativar usuário
router.post('/:id/deactivate', authenticateToken, requireManagerOrAdmin, validateToggleStatus, UsuariosController.deactivateUsuario);

module.exports = router;

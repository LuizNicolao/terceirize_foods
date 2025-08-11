const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const UsuariosController = require('../../controllers/usuariosController');
const {
  createUserValidation,
  updateUserValidation,
  getUserValidation,
  deleteUserValidation
} = require('./usuarioValidator');

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

// Middleware para verificar permissões de administrador
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'administrador' && req.user.role !== 'gestor') {
    return res.status(403).json({ message: 'Acesso negado. Apenas administradores e gestores podem acessar esta funcionalidade.' });
  }
  next();
};

console.log('🚀 Rotas de usuários carregadas - Endpoints disponíveis:');
console.log('  - GET /api/usuarios/');
console.log('  - GET /api/usuarios/:id');
console.log('  - POST /api/usuarios/');
console.log('  - PUT /api/usuarios/:id');
console.log('  - DELETE /api/usuarios/:id');
console.log('  - GET /api/usuarios/role/:role');
console.log('  - GET /api/usuarios/ativos');

// GET /api/usuarios - Listar todos os usuários
router.get('/', authenticateToken, requireAdmin, UsuariosController.listarUsuarios);

// GET /api/usuarios/:id - Buscar usuário específico
router.get('/:id', authenticateToken, requireAdmin, getUserValidation, UsuariosController.buscarUsuario);

// POST /api/usuarios - Criar novo usuário
router.post('/', authenticateToken, requireAdmin, createUserValidation, UsuariosController.criarUsuario);

// PUT /api/usuarios/:id - Atualizar usuário
router.put('/:id', authenticateToken, requireAdmin, updateUserValidation, UsuariosController.atualizarUsuario);

// DELETE /api/usuarios/:id - Deletar usuário
router.delete('/:id', authenticateToken, requireAdmin, deleteUserValidation, UsuariosController.deletarUsuario);

// GET /api/usuarios/role/:role - Buscar usuários por role
router.get('/role/:role', authenticateToken, requireAdmin, UsuariosController.buscarUsuariosPorRole);

// GET /api/usuarios/ativos - Buscar usuários ativos
router.get('/ativos', authenticateToken, requireAdmin, UsuariosController.buscarUsuariosAtivos);

module.exports = router;

/**
 * Rotas de Usuários
 * Implementa padrões RESTful com validação
 */

const express = require('express');
const { authenticateToken, checkPermission, checkScreenPermission } = require('../../middleware/auth');
const { paginationMiddleware } = require('../../middleware/pagination');
const { hateoasMiddleware } = require('../../middleware/hateoas');
const { userValidations, commonValidations } = require('./usuarioValidator');
const UsuariosController = require('../../controllers/usuarios');

const router = express.Router();

// Aplicar middlewares globais
router.use(authenticateToken);
router.use(paginationMiddleware);
router.use(hateoasMiddleware('usuarios'));

// GET /api/usuarios - Listar usuários com paginação e busca
router.get('/', 
  checkPermission('visualizar'),
  commonValidations.search,
  ...commonValidations.pagination,
  UsuariosController.listarUsuarios
);

// GET /api/usuarios/tipo/:tipo - Buscar usuários por tipo de acesso
router.get('/tipo/:tipo',
  checkPermission('visualizar'),
  UsuariosController.buscarPorTipoAcesso
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
  userValidations.create,
  UsuariosController.criarUsuario
);

// PUT /api/usuarios/:id - Atualizar usuário
router.put('/:id', 
  checkPermission('editar'),
  userValidations.update,
  UsuariosController.atualizarUsuario
);

// DELETE /api/usuarios/:id - Excluir usuário (soft delete)
router.delete('/:id', 
  checkPermission('excluir'),
  commonValidations.id,
  UsuariosController.excluirUsuario
);

// PUT /api/usuarios/:id/senha - Alterar senha
router.put('/:id/senha',
  commonValidations.id,
  UsuariosController.alterarSenha
);

// ===== ROTAS PARA FILIAIS =====
// Removidas - não usadas no chamados-platforma

// ===== ROTAS DE EXPORTAÇÃO =====
// Removidas - podem ser adicionadas depois se necessário
// router.get('/export/xlsx', checkScreenPermission('usuarios', 'visualizar'), UsuariosController.exportarXLSX);
// router.get('/export/pdf', checkScreenPermission('usuarios', 'visualizar'), UsuariosController.exportarPDF);

module.exports = router; 
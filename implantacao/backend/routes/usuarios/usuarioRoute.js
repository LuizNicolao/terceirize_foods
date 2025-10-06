/**
 * Rotas de Usuários
 * Implementa padrões RESTful com HATEOAS, paginação e validação
 */

const express = require('express');
const { authenticateToken, checkScreenPermission } = require('../../middleware/auth');
const { userValidations, commonValidations } = require('./usuarioValidator');
const { paginationMiddleware } = require('../../middleware/pagination');
const { hateoasMiddleware } = require('../../middleware/hateoas');
const { auditMiddleware, AUDIT_ACTIONS } = require('../../utils/audit');
const { usuariosLimiter } = require('../../middleware/rateLimiter');
const { createEntityValidationHandler } = require('../../middleware/validationHandler');
const UsuariosController = require('../../controllers/usuarios');

const router = express.Router();

// Aplicar middlewares globais
router.use(usuariosLimiter);
router.use(authenticateToken);
router.use(paginationMiddleware);
router.use(hateoasMiddleware('usuarios'));

// GET /api/usuarios - Listar usuários com paginação e busca
router.get('/', 
  checkScreenPermission('usuarios', 'visualizar'),
  commonValidations.search,
  commonValidations.pagination,
  UsuariosController.listarUsuarios
);

// GET /api/usuarios/tipo/:tipo - Buscar usuários por tipo de acesso
router.get('/tipo/:tipo',
  checkScreenPermission('usuarios', 'visualizar'),
  UsuariosController.buscarPorTipoAcesso
);

// GET /api/usuarios/tipo/:tipo/filiais/:filialId - Buscar usuários por tipo e filial específica
router.get('/tipo/:tipo/filiais/:filialId',
  checkScreenPermission('usuarios', 'visualizar'),
  UsuariosController.buscarPorTipoEFilial
);

// GET /api/usuarios/:id - Buscar usuário por ID
router.get('/:id', 
  checkScreenPermission('usuarios', 'visualizar'),
  commonValidations.id,
  UsuariosController.buscarUsuarioPorId
);

// POST /api/usuarios - Criar novo usuário
router.post('/', 
  checkScreenPermission('usuarios', 'criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'usuarios'),
  userValidations.create,
  createEntityValidationHandler('usuarios'),
  UsuariosController.criarUsuario
);

// PUT /api/usuarios/:id - Atualizar usuário
router.put('/:id', 
  checkScreenPermission('usuarios', 'editar'),
  auditMiddleware(AUDIT_ACTIONS.UPDATE, 'usuarios'),
  userValidations.update,
  createEntityValidationHandler('usuarios'),
  UsuariosController.atualizarUsuario
);

// DELETE /api/usuarios/:id - Excluir usuário (soft delete)
router.delete('/:id', 
  checkScreenPermission('usuarios', 'excluir'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'usuarios'),
  commonValidations.id,
  UsuariosController.excluirUsuario
);

// PUT /api/usuarios/:id/senha - Alterar senha
router.put('/:id/senha',
  commonValidations.id,
  UsuariosController.alterarSenha
);

// ===== ROTAS PARA FILIAIS =====

// GET /api/usuarios/:id/filiais - Buscar filiais do usuário
router.get('/:id/filiais',
  checkScreenPermission('usuarios', 'visualizar'),
  commonValidations.id,
  UsuariosController.buscarFiliaisUsuario
);

// PUT /api/usuarios/:id/filiais - Atualizar filiais do usuário
router.put('/:id/filiais',
  checkScreenPermission('usuarios', 'editar'),
  auditMiddleware(AUDIT_ACTIONS.UPDATE, 'usuarios'),
  commonValidations.id,
  UsuariosController.atualizarFiliaisUsuario
);

module.exports = router; 
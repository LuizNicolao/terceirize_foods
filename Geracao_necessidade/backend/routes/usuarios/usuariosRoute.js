/**
 * Rotas de Usuários
 * Implementa padrões RESTful com HATEOAS, paginação e validação
 */

const express = require('express');
const { authenticateToken } = require('../../middleware/auth');
const { canView, canCreate, canEdit, canDelete } = require('../../middleware/permissoes');
const { userValidations, commonValidations } = require('./usuariosValidator');
const { paginationMiddleware } = require('../../middleware/pagination');
const { hateoasMiddleware } = require('../../middleware/hateoas');
const { auditMiddleware, AUDIT_ACTIONS } = require('../../utils/audit');
const UsuariosController = require('../../controllers/usuarios');

const router = express.Router();

// Aplicar middlewares globais
router.use(authenticateToken);
router.use(paginationMiddleware);
router.use(hateoasMiddleware('usuarios'));

// GET /api/usuarios - Listar usuários com paginação e busca
router.get('/', 
  canView('usuarios'),
  ...commonValidations.search,
  ...commonValidations.pagination,
  UsuariosController.listar
);

// GET /api/usuarios/buscar/:email - Buscar usuários por email
router.get('/buscar/:email',
  canView('usuarios'),
  ...userValidations.email,
  UsuariosController.buscarPorEmail
);

// GET /api/usuarios/:id - Buscar usuário por ID
router.get('/:id', 
  canView('usuarios'),
  ...userValidations.id,
  UsuariosController.buscarPorId
);

// POST /api/usuarios - Criar novo usuário
router.post('/', 
  canCreate('usuarios'),
  ...userValidations.create,
  auditMiddleware(AUDIT_ACTIONS.CREATE),
  UsuariosController.criar
);

// PUT /api/usuarios/:id - Atualizar usuário
router.put('/:id', 
  canEdit('usuarios'),
  ...userValidations.id,
  ...userValidations.update,
  auditMiddleware(AUDIT_ACTIONS.UPDATE),
  UsuariosController.atualizar
);

// DELETE /api/usuarios/:id - Deletar usuário
router.delete('/:id', 
  canDelete('usuarios'),
  ...userValidations.id,
  auditMiddleware(AUDIT_ACTIONS.DELETE),
  UsuariosController.deletar
);

// ===== ROTAS DE ESTATÍSTICAS =====

// GET /api/usuarios/stats/estatisticas - Obter estatísticas detalhadas
router.get('/stats/estatisticas', 
  canView('usuarios'),
  ...commonValidations.dateRange,
  UsuariosController.obterEstatisticas
);

// GET /api/usuarios/stats/resumo - Obter resumo por período
router.get('/stats/resumo', 
  canView('usuarios'),
  ...commonValidations.dateRange,
  UsuariosController.obterResumo
);

module.exports = router;

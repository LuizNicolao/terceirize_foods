const express = require('express');
const { authenticateToken, checkPermission } = require('../middleware/auth');
const { auditMiddleware, auditChangesMiddleware, AUDIT_ACTIONS } = require('../utils/audit');
const { motoristaValidations, motoristaAtualizacaoValidations } = require('../middleware/validation');
const { paginationMiddleware } = require('../middleware/pagination');
const { hateoasMiddleware } = require('../middleware/hateoas');
const { handleValidationErrors } = require('../middleware/responseHandler');
const motoristasController = require('../controllers/motoristasController');

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// ===== ROTAS PRINCIPAIS DE MOTORISTAS =====

// Listar motoristas com paginação, busca e filtros
router.get('/', 
  checkPermission('visualizar'),
  paginationMiddleware,
  motoristasController.listarMotoristas,
  hateoasMiddleware
);

// ===== ROTAS ESPECÍFICAS =====

// Buscar motoristas ativos
router.get('/ativos/listar', 
  checkPermission('visualizar'),
  motoristasController.buscarMotoristasAtivos,
  hateoasMiddleware
);

// Buscar motoristas por filial
router.get('/filial/:filialId', 
  checkPermission('visualizar'),
  motoristasController.buscarMotoristasPorFilial,
  hateoasMiddleware
);

// Buscar motoristas por categoria CNH
router.get('/categoria-cnh/:categoria', 
  checkPermission('visualizar'),
  motoristasController.buscarMotoristasPorCategoriaCnh,
  hateoasMiddleware
);

// Listar categorias CNH disponíveis
router.get('/categorias-cnh/listar', 
  checkPermission('visualizar'),
  motoristasController.listarCategoriasCnh,
  hateoasMiddleware
);

// Buscar motoristas com CNH vencendo em breve
router.get('/cnh-vencendo', 
  checkPermission('visualizar'),
  motoristasController.buscarMotoristasCnhVencendo,
  hateoasMiddleware
);

// ===== ROTAS CRUD PRINCIPAIS =====

// Buscar motorista por ID
router.get('/:id', 
  checkPermission('visualizar'),
  motoristasController.buscarMotoristaPorId,
  hateoasMiddleware
);

// Criar motorista
router.post('/', [
  checkPermission('criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'motoristas'),
  motoristaValidations,
  handleValidationErrors
], motoristasController.criarMotorista);

// Atualizar motorista
router.put('/:id', [
  checkPermission('editar'),
  auditChangesMiddleware(AUDIT_ACTIONS.UPDATE, 'motoristas'),
  motoristaAtualizacaoValidations,
  handleValidationErrors
], motoristasController.atualizarMotorista);

// Excluir motorista
router.delete('/:id', [
  checkPermission('excluir'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'motoristas')
], motoristasController.excluirMotorista);

module.exports = router; 
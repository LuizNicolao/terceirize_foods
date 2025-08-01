const express = require('express');
const { authenticateToken, checkPermission } = require('../middleware/auth');
const { auditMiddleware, auditChangesMiddleware, AUDIT_ACTIONS } = require('../utils/audit');
const { veiculoValidations, veiculoAtualizacaoValidations, handleValidationErrors } = require('../middleware/validation');
const { paginationMiddleware } = require('../middleware/pagination');
const { hateoasMiddleware } = require('../middleware/hateoas');
const veiculosController = require('../controllers/veiculosController');

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// ===== ROTAS PRINCIPAIS DE VEÍCULOS =====

// Listar veículos com paginação, busca e filtros
router.get('/', 
  checkPermission('visualizar'),
  paginationMiddleware,
  veiculosController.listarVeiculos,
  hateoasMiddleware
);

// ===== ROTAS ESPECÍFICAS =====

// Buscar veículos ativos
router.get('/ativos/listar', 
  checkPermission('visualizar'),
  veiculosController.buscarVeiculosAtivos,
  hateoasMiddleware
);

// Buscar veículos por filial
router.get('/filial/:filialId', 
  checkPermission('visualizar'),
  veiculosController.buscarVeiculosPorFilial,
  hateoasMiddleware
);

// Buscar veículos por tipo
router.get('/tipo/:tipo', 
  checkPermission('visualizar'),
  veiculosController.buscarVeiculosPorTipo,
  hateoasMiddleware
);

// Listar tipos de veículos
router.get('/tipos/listar', 
  checkPermission('visualizar'),
  veiculosController.listarTiposVeiculos,
  hateoasMiddleware
);

// Listar categorias de veículos
router.get('/categorias/listar', 
  checkPermission('visualizar'),
  veiculosController.listarCategoriasVeiculos,
  hateoasMiddleware
);

// Buscar veículos com documentação vencendo
router.get('/documentacao/vencendo', 
  checkPermission('visualizar'),
  veiculosController.buscarVeiculosDocumentacaoVencendo,
  hateoasMiddleware
);

// ===== ROTAS CRUD PRINCIPAIS =====

// Buscar veículo por ID
router.get('/:id', 
  checkPermission('visualizar'),
  veiculosController.buscarVeiculoPorId,
  hateoasMiddleware
);

// Criar veículo
router.post('/', [
  checkPermission('criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'veiculos'),
  veiculoValidations,
  handleValidationErrors
], veiculosController.criarVeiculo);

// Atualizar veículo
router.put('/:id', [
  checkPermission('editar'),
  auditChangesMiddleware(AUDIT_ACTIONS.UPDATE, 'veiculos'),
  veiculoAtualizacaoValidations,
  handleValidationErrors
], veiculosController.atualizarVeiculo);

// Excluir veículo
router.delete('/:id', [
  checkPermission('excluir'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'veiculos')
], veiculosController.excluirVeiculo);

module.exports = router; 
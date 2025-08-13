/**
 * Rotas de Veículos
 * Implementa padrões RESTful com HATEOAS, paginação e validação
 */

const express = require('express');
const { authenticateToken, checkScreenPermission } = require('../../middleware/auth');
const { veiculoValidations, commonValidations } = require('./veiculoValidator');
const { paginationMiddleware } = require('../../middleware/pagination');
const { hateoasMiddleware } = require('../../middleware/hateoas');
const { auditMiddleware, auditChangesMiddleware, AUDIT_ACTIONS } = require('../../utils/audit');
const veiculosController = require('../../controllers/veiculos');

const router = express.Router();

// Aplicar middlewares globais
router.use(authenticateToken);
router.use(paginationMiddleware);
router.use(hateoasMiddleware('veiculos'));

// ===== ROTAS PRINCIPAIS DE VEÍCULOS =====

// Listar veículos com paginação, busca e filtros
router.get('/', 
  checkScreenPermission('veiculos', 'visualizar'),
  commonValidations.search,
  ...commonValidations.pagination,
  veiculosController.listarVeiculos
);

// ===== ROTAS ESPECÍFICAS =====

// Buscar veículos ativos
router.get('/ativos/listar', 
  checkScreenPermission('veiculos', 'visualizar'),
  veiculosController.buscarVeiculosAtivos
);

// Buscar veículos por filial
router.get('/filial/:filialId', 
  checkScreenPermission('veiculos', 'visualizar'),
  veiculosController.buscarVeiculosPorFilial
);

// Buscar veículos por tipo
router.get('/tipo/:tipo', 
  checkScreenPermission('veiculos', 'visualizar'),
  veiculosController.buscarVeiculosPorTipo
);

// Listar tipos de veículos
router.get('/tipos/listar', 
  checkScreenPermission('veiculos', 'visualizar'),
  veiculosController.listarTiposVeiculos
);

// Listar categorias de veículos
router.get('/categorias/listar', 
  checkScreenPermission('veiculos', 'visualizar'),
  veiculosController.listarCategoriasVeiculos
);

// Buscar veículos com documentação vencendo
router.get('/documentacao/vencendo', 
  checkScreenPermission('veiculos', 'visualizar'),
  veiculosController.buscarVeiculosDocumentacaoVencendo
);

// ===== ROTAS CRUD PRINCIPAIS =====

// Buscar veículo por ID
router.get('/:id', 
  checkScreenPermission('veiculos', 'visualizar'),
  commonValidations.id,
  veiculosController.buscarVeiculoPorId
);

// Criar veículo
router.post('/', [
  checkScreenPermission('veiculos', 'criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'veiculos'),
  veiculoValidations.create
], veiculosController.criarVeiculo);

// Atualizar veículo
router.put('/:id', [
  checkScreenPermission('veiculos', 'editar'),
  auditChangesMiddleware(AUDIT_ACTIONS.UPDATE, 'veiculos'),
  veiculoValidations.update
], veiculosController.atualizarVeiculo);

// Excluir veículo
router.delete('/:id', [
  checkScreenPermission('veiculos', 'excluir'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'veiculos'),
  commonValidations.id
], veiculosController.excluirVeiculo);

module.exports = router;

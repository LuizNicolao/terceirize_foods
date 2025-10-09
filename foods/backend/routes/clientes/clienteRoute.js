/**
 * Rotas de Clientes
 * Implementa padrões RESTful com HATEOAS, paginação e validação
 */

const express = require('express');
const { authenticateToken, checkPermission, checkScreenPermission } = require('../../middleware/auth');
const { clienteValidations, commonValidations } = require('./clienteValidator');
const { paginationMiddleware } = require('../../middleware/pagination');
const { hateoasMiddleware } = require('../../middleware/hateoas');
const { auditMiddleware, AUDIT_ACTIONS } = require('../../utils/audit');
const ClientesController = require('../../controllers/clientes');

const router = express.Router();

// Aplicar middlewares globais
router.use(authenticateToken);
router.use(paginationMiddleware);
router.use(hateoasMiddleware('clientes'));

// GET /api/clientes - Listar clientes com paginação e busca
router.get('/', 
  checkPermission('visualizar'),
  commonValidations.search,
  commonValidations.pagination,
  ClientesController.listarClientes
);

// GET /api/clientes/:id - Buscar cliente por ID
router.get('/:id', 
  checkPermission('visualizar'),
  commonValidations.id,
  ClientesController.buscarClientePorId
);

// POST /api/clientes - Criar novo cliente
router.post('/', 
  checkPermission('criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'clientes'),
  clienteValidations.create,
  ClientesController.criarCliente
);

// PUT /api/clientes/:id - Atualizar cliente
router.put('/:id', 
  checkPermission('editar'),
  auditMiddleware(AUDIT_ACTIONS.UPDATE, 'clientes'),
  clienteValidations.update,
  ClientesController.atualizarCliente
);

// DELETE /api/clientes/:id - Excluir cliente (soft delete)
router.delete('/:id', 
  checkPermission('excluir'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'clientes'),
  commonValidations.id,
  ClientesController.excluirCliente
);

// GET /api/clientes/buscar-cnpj/:cnpj - Buscar dados do CNPJ via API externa
router.get('/buscar-cnpj/:cnpj',
  checkPermission('visualizar'),
  ClientesController.buscarCNPJ
);

// GET /api/clientes/uf/:uf - Buscar clientes por UF
router.get('/uf/:uf',
  checkPermission('visualizar'),
  ClientesController.buscarPorUF
);

// GET /api/clientes/ativos - Buscar clientes ativos
router.get('/ativos',
  checkPermission('visualizar'),
  ClientesController.buscarAtivos
);

router.get('/export/xlsx', checkScreenPermission('clientes', 'visualizar'), ClientesController.exportarXLSX);
router.get('/export/pdf', checkScreenPermission('clientes', 'visualizar'), ClientesController.exportarPDF);

module.exports = router;

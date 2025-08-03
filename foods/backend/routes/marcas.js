/**
 * Rotas de Marcas
 * Implementa padrões RESTful com HATEOAS, paginação e validação
 */

const express = require('express');
const { authenticateToken, checkPermission } = require('../middleware/auth');
const { marcaValidations, commonValidations } = require('../middleware/validation');
const { paginationMiddleware } = require('../middleware/pagination');
const { hateoasMiddleware } = require('../middleware/hateoas');
const { auditMiddleware, AUDIT_ACTIONS } = require('../utils/audit');
const MarcasController = require('../controllers/marcasController');

const router = express.Router();

// Aplicar middlewares globais
router.use(authenticateToken);
router.use(paginationMiddleware);
router.use(hateoasMiddleware('marcas'));

// GET /api/marcas - Listar marcas com paginação e busca
router.get('/', 
  checkPermission('visualizar'),
  commonValidations.search,
  commonValidations.pagination,
  MarcasController.listarMarcas
);

// GET /api/marcas/:id - Buscar marca por ID
router.get('/:id', 
  checkPermission('visualizar'),
  commonValidations.id,
  MarcasController.buscarMarcaPorId
);

// POST /api/marcas - Criar nova marca
router.post('/', 
  checkPermission('criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'marcas'),
  marcaValidations.create,
  MarcasController.criarMarca
);

// PUT /api/marcas/:id - Atualizar marca
router.put('/:id', 
  checkPermission('editar'),
  auditMiddleware(AUDIT_ACTIONS.UPDATE, 'marcas'),
  marcaValidations.update,
  MarcasController.atualizarMarca
);

// DELETE /api/marcas/:id - Excluir marca (soft delete)
router.delete('/:id', 
  checkPermission('excluir'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'marcas'),
  commonValidations.id,
  MarcasController.excluirMarca
);

// GET /api/marcas/ativas - Buscar marcas ativas
router.get('/ativas',
  checkPermission('visualizar'),
  MarcasController.buscarAtivas
);

// GET /api/marcas/fabricante/:fabricante - Buscar marcas por fabricante
router.get('/fabricante/:fabricante',
  checkPermission('visualizar'),
  MarcasController.buscarPorFabricante
);

module.exports = router; 
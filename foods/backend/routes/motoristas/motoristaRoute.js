/**
 * Rotas de Motoristas
 * Implementa padrões RESTful com HATEOAS, paginação e validação
 */

const express = require('express');
const { authenticateToken, checkPermission } = require('../../middleware/auth');
const { motoristaValidations, commonValidations } = require('./motoristaValidator');
const { paginationMiddleware } = require('../../middleware/pagination');
const { hateoasMiddleware } = require('../../middleware/hateoas');
const { auditMiddleware, AUDIT_ACTIONS } = require('../../utils/audit');
const motoristasController = require('../../controllers/motoristas');

const router = express.Router();

// Aplicar middlewares globais
router.use(authenticateToken);
router.use(paginationMiddleware);
router.use(hateoasMiddleware('motoristas'));

// GET /api/motoristas - Listar motoristas com paginação e busca
router.get('/', 
  checkPermission('visualizar'),
  commonValidations.search,
  commonValidations.pagination,
  motoristasController.listarMotoristas
);

// GET /api/motoristas/:id - Buscar motorista por ID
router.get('/:id', 
  checkPermission('visualizar'),
  commonValidations.id,
  motoristasController.buscarMotoristaPorId
);

// POST /api/motoristas - Criar novo motorista
router.post('/', 
  checkPermission('criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'motoristas'),
  motoristaValidations.create,
  motoristasController.criarMotorista
);

// PUT /api/motoristas/:id - Atualizar motorista
router.put('/:id', 
  checkPermission('editar'),
  auditMiddleware(AUDIT_ACTIONS.UPDATE, 'motoristas'),
  motoristaValidations.update,
  motoristasController.atualizarMotorista
);

// DELETE /api/motoristas/:id - Excluir motorista
router.delete('/:id', 
  checkPermission('excluir'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'motoristas'),
  commonValidations.id,
  motoristasController.excluirMotorista
);



module.exports = router;

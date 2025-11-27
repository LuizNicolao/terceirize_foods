/**
 * Rotas de Notas Fiscais
 * Implementa padrões RESTful com HATEOAS, paginação e validação
 */

const express = require('express');
const { authenticateToken, checkScreenPermission } = require('../../middleware/auth');
const { notaFiscalValidations, commonValidations } = require('./notaFiscalValidator');
const { paginationMiddleware } = require('../../middleware/pagination');
const { hateoasMiddleware } = require('../../middleware/hateoas');
const { auditMiddleware, AUDIT_ACTIONS } = require('../../utils/audit');
const NotasFiscaisController = require('../../controllers/notas-fiscais');

const router = express.Router();

// Aplicar middlewares globais
router.use(authenticateToken);
router.use(paginationMiddleware);
router.use(hateoasMiddleware('notas-fiscais'));

// ===== ROTAS PRINCIPAIS DE NOTAS FISCAIS =====

// Listar notas fiscais com paginação, busca e filtros
router.get('/', 
  commonValidations.pagination,
  NotasFiscaisController.listarNotasFiscais
);

// Buscar nota fiscal por ID
router.get('/:id', 
  commonValidations.id,
  NotasFiscaisController.buscarNotaFiscalPorId
);

// Criar nota fiscal
router.post('/', 
  checkScreenPermission('notas-fiscais', 'criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'notas-fiscais'),
  notaFiscalValidations.create,
  NotasFiscaisController.criarNotaFiscal
);

// Atualizar nota fiscal
router.put('/:id', 
  checkScreenPermission('notas-fiscais', 'editar'),
  auditMiddleware(AUDIT_ACTIONS.UPDATE, 'notas-fiscais'),
  commonValidations.id,
  notaFiscalValidations.update,
  NotasFiscaisController.atualizarNotaFiscal
);

// Excluir nota fiscal
router.delete('/:id', 
  checkScreenPermission('notas-fiscais', 'excluir'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'notas-fiscais'),
  commonValidations.id,
  NotasFiscaisController.excluirNotaFiscal
);

// ===== ROTAS ESPECÍFICAS =====

// Buscar quantidades já lançadas para um pedido de compra
router.get('/quantidades-lancadas/:pedido_compra_id',
  NotasFiscaisController.buscarQuantidadesLancadas
);

module.exports = router;


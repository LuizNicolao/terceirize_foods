/**
 * Rotas de Receitas
 * Implementa padrões RESTful com HATEOAS, paginação e validação
 */

const express = require('express');
const { authenticateToken, checkScreenPermission } = require('../../middleware/auth');
const { receitasValidations, commonValidations } = require('./receitasValidator');
const { paginationMiddleware } = require('../../middleware/pagination');
const { hateoasMiddleware } = require('../../middleware/hateoas');
const { auditMiddleware, auditChangesMiddleware, AUDIT_ACTIONS } = require('../../utils/audit');
const { uploadPDF, handleUploadError } = require('../../middleware/uploadPDF');
const { 
  ReceitasListController, 
  ReceitasCRUDController, 
  ReceitasExportController 
} = require('../../controllers/receitas');

const router = express.Router();

// Aplicar middlewares globais
router.use(authenticateToken);
router.use(paginationMiddleware);
router.use(hateoasMiddleware('receitas'));

// ===== ROTAS PRINCIPAIS DE RECEITAS =====

// Listar receitas com paginação, busca e filtros
router.get('/', 
  checkScreenPermission('receitas', 'visualizar'),
  commonValidations.search,
  ...commonValidations.pagination,
  receitasValidations.filtros,
  ReceitasListController.listar
);

// Buscar receita por ID
router.get('/:id',
  checkScreenPermission('receitas', 'visualizar'),
  commonValidations.id,
  ReceitasListController.buscarPorId
);

// Criar nova receita
router.post('/',
  checkScreenPermission('receitas', 'criar'),
  receitasValidations.criar,
  auditMiddleware('receitas', AUDIT_ACTIONS.CREATE),
  ReceitasCRUDController.criar
);

// Atualizar receita
router.put('/:id',
  checkScreenPermission('receitas', 'editar'),
  commonValidations.id,
  receitasValidations.atualizar,
  auditChangesMiddleware('receitas', AUDIT_ACTIONS.UPDATE),
  ReceitasCRUDController.atualizar
);

// Excluir receita
router.delete('/:id',
  checkScreenPermission('receitas', 'excluir'),
  commonValidations.id,
  auditMiddleware('receitas', AUDIT_ACTIONS.DELETE),
  ReceitasCRUDController.excluir
);

// ===== ROTAS ESPECÍFICAS =====


// Exportar receita
router.get('/:id/exportar/:formato',
  checkScreenPermission('receitas', 'visualizar'),
  commonValidations.id,
  receitasValidations.formatoExportacao,
  ReceitasExportController.exportar
);

router.get('/export/xlsx', checkScreenPermission('receitas', 'visualizar'), ReceitasController.exportarXLSX);
router.get('/export/pdf', checkScreenPermission('receitas', 'visualizar'), ReceitasController.exportarPDF);

module.exports = router;

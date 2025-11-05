/**
 * Rotas de PDF Templates
 * Implementa padrões RESTful com HATEOAS, paginação e validação
 */

const express = require('express');
const { authenticateToken, checkScreenPermission } = require('../../middleware/auth');
const { pdfTemplatesValidations, commonValidations } = require('./pdfTemplatesValidator');
const { paginationMiddleware } = require('../../middleware/pagination');
const { hateoasMiddleware } = require('../../middleware/hateoas');
const { auditMiddleware, auditChangesMiddleware, AUDIT_ACTIONS } = require('../../utils/audit');
const pdfTemplatesController = require('../../controllers/pdf-templates');

const router = express.Router();

// Aplicar middlewares globais
router.use(authenticateToken);
router.use(paginationMiddleware);
router.use(hateoasMiddleware('pdf-templates'));

// ===== ROTAS PRINCIPAIS DE PDF TEMPLATES =====

// Listar templates com paginação, busca e filtros
router.get('/', 
  checkScreenPermission('pdf_templates', 'visualizar'),
  commonValidations.search,
  ...commonValidations.pagination,
  pdfTemplatesValidations.filtros,
  pdfTemplatesController.listar
);

// Buscar template por ID
router.get('/:id',
  checkScreenPermission('pdf_templates', 'visualizar'),
  commonValidations.id,
  pdfTemplatesController.buscarPorId
);

// Listar telas disponíveis
router.get('/telas-disponiveis',
  checkScreenPermission('pdf_templates', 'visualizar'),
  pdfTemplatesController.listarTelasDisponiveis
);

// Buscar template padrão por tela
router.get('/tela/:tela/padrao',
  checkScreenPermission('pdf_templates', 'visualizar'),
  pdfTemplatesController.buscarTemplatePadrao
);

// Criar novo template
router.post('/',
  checkScreenPermission('pdf_templates', 'criar'),
  pdfTemplatesValidations.criar,
  auditMiddleware('pdf_templates', AUDIT_ACTIONS.CREATE),
  pdfTemplatesController.criar
);

// Atualizar template
router.put('/:id',
  checkScreenPermission('pdf_templates', 'editar'),
  commonValidations.id,
  pdfTemplatesValidations.atualizar,
  auditChangesMiddleware('pdf_templates', AUDIT_ACTIONS.UPDATE),
  pdfTemplatesController.atualizar
);

// Excluir template
router.delete('/:id',
  checkScreenPermission('pdf_templates', 'excluir'),
  commonValidations.id,
  auditMiddleware('pdf_templates', AUDIT_ACTIONS.DELETE),
  pdfTemplatesController.excluir
);

module.exports = router;


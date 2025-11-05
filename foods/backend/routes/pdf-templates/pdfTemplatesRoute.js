/**
 * Rotas de Templates de PDF
 * Implementa padrões RESTful com HATEOAS, paginação e validação
 */

const express = require('express');
const { body } = require('express-validator');
const { authenticateToken, checkPermission } = require('../../middleware/auth');
const { paginationMiddleware } = require('../../middleware/pagination');
const { hateoasMiddleware } = require('../../middleware/hateoas');
const { auditMiddleware, auditChangesMiddleware, AUDIT_ACTIONS } = require('../../utils/audit');
const { pdfTemplatesValidations, handleValidationErrors } = require('./pdfTemplatesValidator');
const PdfTemplatesController = require('../../controllers/pdf-templates');

const router = express.Router();

// Aplicar middlewares globais
router.use(authenticateToken);
router.use(paginationMiddleware);
router.use(hateoasMiddleware('pdf-templates'));

// ========== ROTAS PRINCIPAIS ==========

// GET /api/pdf-templates - Listar todos os templates
router.get('/',
  checkPermission('visualizar'),
  PdfTemplatesController.listarTemplates
);

// GET /api/pdf-templates/telas-disponiveis - Listar telas disponíveis
router.get('/telas-disponiveis',
  checkPermission('visualizar'),
  PdfTemplatesController.listarTelasDisponiveis
);

// GET /api/pdf-templates/tela/:tela_vinculada/padrao - Buscar template padrão de uma tela
router.get('/tela/:tela_vinculada/padrao',
  checkPermission('visualizar'),
  PdfTemplatesController.buscarTemplatePadrao
);

// GET /api/pdf-templates/:id - Buscar template por ID
router.get('/:id',
  checkPermission('visualizar'),
  PdfTemplatesController.buscarTemplatePorId
);

// POST /api/pdf-templates - Criar novo template
router.post('/',
  checkPermission('criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'pdf_templates'),
  pdfTemplatesValidations.create,
  handleValidationErrors,
  PdfTemplatesController.criarTemplate
);

// PUT /api/pdf-templates/:id - Atualizar template
router.put('/:id',
  checkPermission('editar'),
  auditChangesMiddleware(AUDIT_ACTIONS.UPDATE, 'pdf_templates'),
  pdfTemplatesValidations.update,
  handleValidationErrors,
  PdfTemplatesController.atualizarTemplate
);

// DELETE /api/pdf-templates/:id - Excluir template
router.delete('/:id',
  checkPermission('excluir'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'pdf_templates'),
  PdfTemplatesController.excluirTemplate
);

// POST /api/pdf-templates/gerar-pdf - Gerar PDF usando template
router.post('/gerar-pdf',
  checkPermission('visualizar'),
  body('tela_vinculada').notEmpty().withMessage('Tela vinculada é obrigatória'),
  body('dados').isObject().withMessage('Dados devem ser um objeto'),
  PdfTemplatesController.gerarPDFComTemplate
);

module.exports = router;


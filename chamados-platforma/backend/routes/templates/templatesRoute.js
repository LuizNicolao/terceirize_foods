/**
 * Rotas de Templates
 */

const express = require('express');
const router = express.Router();
const TemplatesController = require('../../controllers/templates/TemplatesController');
const { checkPermission } = require('../../middleware/auth');
const { param, query, body } = require('express-validator');
const { createEntityValidationHandler } = require('../../middleware/validationHandler');

const handleValidationErrors = createEntityValidationHandler('templates');

// GET /api/templates - Listar templates
router.get('/',
  checkPermission('visualizar'),
  TemplatesController.listarTemplates
);

// GET /api/templates/:id - Buscar template por ID
router.get('/:id',
  checkPermission('visualizar'),
  param('id').isInt({ min: 1 }).withMessage('ID deve ser um número inteiro positivo'),
  TemplatesController.buscarTemplatePorId
);

// POST /api/templates - Criar template
router.post('/',
  checkPermission('criar'),
  body('nome').notEmpty().withMessage('Nome é obrigatório'),
  body('conteudo').notEmpty().withMessage('Conteúdo é obrigatório'),
  handleValidationErrors,
  TemplatesController.criarTemplate
);

// PUT /api/templates/:id - Atualizar template
router.put('/:id',
  checkPermission('editar'),
  param('id').isInt({ min: 1 }).withMessage('ID deve ser um número inteiro positivo'),
  handleValidationErrors,
  TemplatesController.atualizarTemplate
);

// DELETE /api/templates/:id - Excluir template
router.delete('/:id',
  checkPermission('excluir'),
  param('id').isInt({ min: 1 }).withMessage('ID deve ser um número inteiro positivo'),
  TemplatesController.excluirTemplate
);

module.exports = router;


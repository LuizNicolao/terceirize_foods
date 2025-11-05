/**
 * Validadores para Templates de PDF
 */

const { body } = require('express-validator');
const { createEntityValidationHandler } = require('../../middleware/validationHandler');

// Criar handler de validação específico para templates de PDF
const handleValidationErrors = createEntityValidationHandler('pdf-templates');

const pdfTemplatesValidations = {
  create: [
    body('nome')
      .notEmpty()
      .withMessage('Nome do template é obrigatório')
      .isLength({ min: 3, max: 255 })
      .withMessage('Nome deve ter entre 3 e 255 caracteres'),
    
    body('tela_vinculada')
      .notEmpty()
      .withMessage('Tela vinculada é obrigatória')
      .isIn(['solicitacoes-compras', 'pedidos-compras', 'relatorio-inspecao'])
      .withMessage('Tela vinculada inválida'),
    
    body('html_template')
      .notEmpty()
      .withMessage('HTML template é obrigatório'),
    
    body('descricao')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Descrição deve ter no máximo 1000 caracteres'),
    
    body('ativo')
      .optional()
      .isBoolean()
      .withMessage('Ativo deve ser um booleano'),
    
    body('padrao')
      .optional()
      .isBoolean()
      .withMessage('Padrão deve ser um booleano'),
    
    body('variaveis_disponiveis')
      .optional()
      .isArray()
      .withMessage('Variáveis disponíveis deve ser um array')
  ],

  update: [
    body('nome')
      .optional()
      .isLength({ min: 3, max: 255 })
      .withMessage('Nome deve ter entre 3 e 255 caracteres'),
    
    body('tela_vinculada')
      .optional()
      .isIn(['solicitacoes-compras', 'pedidos-compras', 'relatorio-inspecao'])
      .withMessage('Tela vinculada inválida'),
    
    body('descricao')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Descrição deve ter no máximo 1000 caracteres'),
    
    body('ativo')
      .optional()
      .isBoolean()
      .withMessage('Ativo deve ser um booleano'),
    
    body('padrao')
      .optional()
      .isBoolean()
      .withMessage('Padrão deve ser um booleano'),
    
    body('variaveis_disponiveis')
      .optional()
      .isArray()
      .withMessage('Variáveis disponíveis deve ser um array')
  ]
};

module.exports = {
  pdfTemplatesValidations,
  handleValidationErrors
};


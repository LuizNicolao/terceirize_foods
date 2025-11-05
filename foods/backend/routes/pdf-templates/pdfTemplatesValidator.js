/**
 * Validadores para PDF Templates
 * Implementa validações específicas para operações de templates de PDF
 */

const { body, param, query } = require('express-validator');

// Validações comuns (reutilizáveis)
const commonValidations = {
  // Validação de ID
  id: [
    param('id').isInt({ min: 1 }).withMessage('ID deve ser um número inteiro positivo')
  ],

  // Validação de busca
  search: [
    query('search').optional().isString().trim().isLength({ max: 100 })
      .withMessage('Termo de busca deve ter no máximo 100 caracteres')
  ],

  // Validações de paginação
  pagination: [
    query('page').optional().isInt({ min: 1 }).withMessage('Página deve ser um número inteiro positivo'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limite deve ser entre 1 e 100')
  ]
};

// Validações específicas de PDF templates
const pdfTemplatesValidations = {
  // Filtros de busca
  filtros: [
    query('tela_vinculada').optional().isString().trim()
      .withMessage('Tela vinculada deve ser uma string'),
    query('ativo').optional().isBoolean().withMessage('Ativo deve ser um booleano')
  ],

  // Validação para criar template
  criar: [
    body('nome').trim().notEmpty().withMessage('Nome é obrigatório')
      .isLength({ max: 255 }).withMessage('Nome deve ter no máximo 255 caracteres'),
    body('descricao').optional().isString().trim().isLength({ max: 500 })
      .withMessage('Descrição deve ter no máximo 500 caracteres'),
    body('tela_vinculada').trim().notEmpty().withMessage('Tela vinculada é obrigatória')
      .isIn(['solicitacoes-compras', 'pedidos-compras', 'relatorio-inspecao'])
      .withMessage('Tela vinculada deve ser uma das opções válidas'),
    body('html_template').trim().notEmpty().withMessage('HTML Template é obrigatório'),
    body('css_styles').optional().isString().trim(),
    body('ativo').optional().isBoolean().withMessage('Ativo deve ser um booleano'),
    body('padrao').optional().isBoolean().withMessage('Padrão deve ser um booleano'),
    body('variaveis_disponiveis').optional().isArray().withMessage('Variáveis disponíveis deve ser um array')
  ],

  // Validação para atualizar template
  atualizar: [
    body('nome').optional().trim().notEmpty().withMessage('Nome não pode ser vazio')
      .isLength({ max: 255 }).withMessage('Nome deve ter no máximo 255 caracteres'),
    body('descricao').optional().isString().trim().isLength({ max: 500 })
      .withMessage('Descrição deve ter no máximo 500 caracteres'),
    body('tela_vinculada').optional().trim().notEmpty().withMessage('Tela vinculada não pode ser vazia')
      .isIn(['solicitacoes-compras', 'pedidos-compras', 'relatorio-inspecao'])
      .withMessage('Tela vinculada deve ser uma das opções válidas'),
    body('html_template').optional().trim().notEmpty().withMessage('HTML Template não pode ser vazio'),
    body('css_styles').optional().isString().trim(),
    body('ativo').optional().isBoolean().withMessage('Ativo deve ser um booleano'),
    body('padrao').optional().isBoolean().withMessage('Padrão deve ser um booleano'),
    body('variaveis_disponiveis').optional().isArray().withMessage('Variáveis disponíveis deve ser um array')
  ]
};

module.exports = {
  pdfTemplatesValidations,
  commonValidations
};


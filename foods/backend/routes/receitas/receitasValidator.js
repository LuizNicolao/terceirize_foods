/**
 * Validadores para Receitas
 * Implementa validações específicas para operações de receitas
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

// Validações específicas de receitas
const receitasValidations = {
  // Filtros de busca
  filtros: [
    query('status').optional().isIn(['processando', 'pendente_aprovacao', 'aprovado', 'rejeitado', 'ativo'])
      .withMessage('Status deve ser: processando, pendente_aprovacao, aprovado, rejeitado ou ativo'),
    query('mes').optional().isInt({ min: 1, max: 12 }).withMessage('Mês deve ser entre 1 e 12'),
    query('ano').optional().isInt({ min: 2020, max: 2030 }).withMessage('Ano deve ser entre 2020 e 2030'),
    query('unidade_escolar_id').optional().isInt({ min: 1 }).withMessage('ID da unidade escolar deve ser um número inteiro positivo')
  ],

  // Validação para criar cardápio
  criar: [
    body('unidade_escolar_id').isInt({ min: 1 }).withMessage('ID da unidade escolar é obrigatório'),
    body('mes').isInt({ min: 1, max: 12 }).withMessage('Mês deve ser entre 1 e 12'),
    body('ano').isInt({ min: 2020, max: 2030 }).withMessage('Ano deve ser entre 2020 e 2030'),
    body('observacoes').optional().isString().trim().isLength({ max: 500 })
      .withMessage('Observações devem ter no máximo 500 caracteres')
  ],

  // Validação para atualizar cardápio
  atualizar: [
    body('observacoes').optional().isString().trim().isLength({ max: 500 })
      .withMessage('Observações devem ter no máximo 500 caracteres'),
    body('status').optional().isIn(['processando', 'pendente_aprovacao', 'aprovado', 'rejeitado', 'ativo'])
      .withMessage('Status deve ser: processando, pendente_aprovacao, aprovado, rejeitado ou ativo')
  ],



  // Validação para formato de exportação
  formatoExportacao: [
    param('formato').isIn(['xlsx', 'pdf', 'csv']).withMessage('Formato deve ser: xlsx, pdf ou csv')
  ]
};

module.exports = {
  receitasValidations,
  commonValidations
};

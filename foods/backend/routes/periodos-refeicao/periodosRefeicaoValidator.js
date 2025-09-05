/**
 * Validadores para Períodos de Refeição
 * Implementa validações específicas para operações de períodos de refeição
 */

const { body, param, query } = require('express-validator');

// Validações comuns
const commonValidations = {
  // Validação de ID
  id: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID deve ser um número inteiro positivo')
  ],

  // Validações de paginação
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Página deve ser um número inteiro positivo'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limite deve ser um número entre 1 e 100')
  ],

  // Validação de busca
  search: [
    query('search')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('Termo de busca deve ter entre 1 e 100 caracteres')
      .trim()
  ]
};

// Validações específicas para períodos de refeição
const periodosRefeicaoValidations = {
  // Validação para criar período de refeição
  create: [
    body('nome')
      .notEmpty()
      .withMessage('Nome é obrigatório')
      .isLength({ min: 2, max: 100 })
      .withMessage('Nome deve ter entre 2 e 100 caracteres')
      .trim(),

    body('codigo')
      .optional()
      .isLength({ min: 1, max: 20 })
      .withMessage('Código deve ter entre 1 e 20 caracteres')
      .trim(),

    body('descricao')
      .optional()
      .isLength({ min: 1, max: 500 })
      .withMessage('Descrição deve ter entre 1 e 500 caracteres')
      .trim(),

    body('status')
      .notEmpty()
      .withMessage('Status é obrigatório')
      .isIn(['ativo', 'inativo'])
      .withMessage('Status deve ser "ativo" ou "inativo"'),

    body('observacoes')
      .optional()
      .isLength({ min: 1, max: 1000 })
      .withMessage('Observações devem ter entre 1 e 1000 caracteres')
      .trim(),

    body('filiais')
      .optional()
      .isArray()
      .withMessage('Filiais deve ser um array')
  ],

  // Validação para atualizar período de refeição
  update: [
    body('nome')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Nome deve ter entre 2 e 100 caracteres')
      .trim(),

    body('codigo')
      .optional()
      .isLength({ min: 1, max: 20 })
      .withMessage('Código deve ter entre 1 e 20 caracteres')
      .trim(),

    body('descricao')
      .optional()
      .isLength({ min: 1, max: 500 })
      .withMessage('Descrição deve ter entre 1 e 500 caracteres')
      .trim(),

    body('status')
      .optional()
      .isIn(['ativo', 'inativo'])
      .withMessage('Status deve ser "ativo" ou "inativo"'),

    body('observacoes')
      .optional()
      .isLength({ min: 1, max: 1000 })
      .withMessage('Observações devem ter entre 1 e 1000 caracteres')
      .trim(),

    body('filiais')
      .optional()
      .isArray()
      .withMessage('Filiais deve ser um array')
  ],

  // Validação para buscar por filial
  buscarPorFilial: [
    param('filialId')
      .isInt({ min: 1 })
      .withMessage('ID da filial deve ser um número inteiro positivo')
  ],

  // Validação para buscar disponíveis para unidade
  buscarDisponiveisParaUnidade: [
    param('unidadeEscolarId')
      .isInt({ min: 1 })
      .withMessage('ID da unidade escolar deve ser um número inteiro positivo')
  ],

  // Validação para buscar por IDs
  buscarPorIds: [
    body('ids')
      .isArray({ min: 1 })
      .withMessage('IDs é obrigatório e deve ser um array não vazio'),
    body('ids.*')
      .isInt({ min: 1 })
      .withMessage('Cada ID deve ser um número inteiro positivo')
  ]
};

// Validações de filtros
const filterValidations = {
  // Filtro por status
  status: [
    query('status')
      .optional()
      .isIn(['ativo', 'inativo'])
      .withMessage('Status deve ser "ativo" ou "inativo"')
  ],

  // Filtro por filial
  filial: [
    query('filial_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ID da filial deve ser um número inteiro positivo')
  ]
};

module.exports = {
  commonValidations,
  periodosRefeicaoValidations,
  filterValidations
};

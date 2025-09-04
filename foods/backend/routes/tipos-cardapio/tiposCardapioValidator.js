/**
 * Validadores para Tipos de Cardápio
 * Implementa validações específicas para operações de tipos de cardápio
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

// Validações específicas para tipos de cardápio
const tiposCardapioValidations = {
  // Validação para criar tipo de cardápio
  create: [
    body('nome')
      .notEmpty()
      .withMessage('Nome é obrigatório')
      .isLength({ min: 2, max: 100 })
      .withMessage('Nome deve ter entre 2 e 100 caracteres')
      .trim(),

    body('codigo')
      .optional()
      .isLength({ min: 1, max: 50 })
      .withMessage('Código deve ter entre 1 e 50 caracteres')
      .matches(/^[A-Z0-9_-]+$/)
      .withMessage('Código deve conter apenas letras maiúsculas, números, hífens e underscores')
      .trim(),

    body('descricao')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Descrição deve ter no máximo 500 caracteres')
      .trim(),

    body('status')
      .optional()
      .isIn(['ativo', 'inativo'])
      .withMessage('Status deve ser "ativo" ou "inativo"'),

    body('observacoes')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Observações devem ter no máximo 1000 caracteres')
      .trim(),

    body('filiais')
      .optional()
      .isArray()
      .withMessage('Filiais deve ser um array')
      .custom((filiais) => {
        if (filiais && filiais.length > 0) {
          const invalidIds = filiais.filter(id => !Number.isInteger(id) || id <= 0);
          if (invalidIds.length > 0) {
            throw new Error('Todos os IDs de filiais devem ser números inteiros positivos');
          }
        }
        return true;
      })
  ],

  // Validação para atualizar tipo de cardápio
  update: [
    body('nome')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Nome deve ter entre 2 e 100 caracteres')
      .trim(),

    body('codigo')
      .optional()
      .isLength({ min: 1, max: 50 })
      .withMessage('Código deve ter entre 1 e 50 caracteres')
      .matches(/^[A-Z0-9_-]+$/)
      .withMessage('Código deve conter apenas letras maiúsculas, números, hífens e underscores')
      .trim(),

    body('descricao')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Descrição deve ter no máximo 500 caracteres')
      .trim(),

    body('status')
      .optional()
      .isIn(['ativo', 'inativo'])
      .withMessage('Status deve ser "ativo" ou "inativo"'),

    body('observacoes')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Observações devem ter no máximo 1000 caracteres')
      .trim(),

    body('filiais')
      .optional()
      .isArray()
      .withMessage('Filiais deve ser um array')
      .custom((filiais) => {
        if (filiais && filiais.length > 0) {
          const invalidIds = filiais.filter(id => !Number.isInteger(id) || id <= 0);
          if (invalidIds.length > 0) {
            throw new Error('Todos os IDs de filiais devem ser números inteiros positivos');
          }
        }
        return true;
      })
  ],

  // Validação para filtros
  filtros: [
    query('status')
      .optional()
      .isIn(['ativo', 'inativo'])
      .withMessage('Status deve ser "ativo" ou "inativo"'),

    query('filial_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ID da filial deve ser um número inteiro positivo')
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
      .withMessage('IDs deve ser um array com pelo menos um elemento')
      .custom((ids) => {
        const invalidIds = ids.filter(id => !Number.isInteger(id) || id <= 0);
        if (invalidIds.length > 0) {
          throw new Error('Todos os IDs devem ser números inteiros positivos');
        }
        return true;
      })
  ]
};

module.exports = {
  commonValidations,
  tiposCardapioValidations
};

/**
 * Validações específicas para Rotas Nutricionistas
 * Implementa validações usando express-validator
 */

const { body, param, query } = require('express-validator');
const { createEntityValidationHandler } = require('../../middleware/validationHandler');

// Criar handler de validação específico para rotas nutricionistas
const handleValidationErrors = createEntityValidationHandler('rotas-nutricionistas');

// Validações comuns
const commonValidations = {
  // Validação de ID numérico
  id: param('id')
    .isInt({ min: 1 })
    .withMessage('ID deve ser um número inteiro positivo'),

  // Validação de busca
  search: query('search')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Termo de busca deve ter entre 1 e 100 caracteres'),

  // Validação de paginação
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Página deve ser um número inteiro positivo'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limite deve ser um número entre 1 e 100')
  ]
};

// Validações específicas para rotas nutricionistas
const rotasNutricionistasValidations = {
  // Validação para filtros de listagem
  filtros: [
    query('status')
      .optional()
      .isIn(['ativo', 'inativo'])
      .withMessage('Status deve ser "ativo" ou "inativo"'),
    query('usuario_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ID do usuário deve ser um número inteiro positivo'),
    query('supervisor_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ID do supervisor deve ser um número inteiro positivo'),
    query('coordenador_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ID do coordenador deve ser um número inteiro positivo'),
    handleValidationErrors
  ],

  // Validação para criar rota nutricionista
  criar: [
    body('codigo')
      .isString()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Código deve ter entre 1 e 50 caracteres'),
    body('usuario_id')
      .isInt({ min: 1 })
      .withMessage('ID do usuário deve ser um número inteiro positivo'),
    body('supervisor_id')
      .isInt({ min: 1 })
      .withMessage('ID do supervisor deve ser um número inteiro positivo'),
    body('coordenador_id')
      .isInt({ min: 1 })
      .withMessage('ID do coordenador deve ser um número inteiro positivo'),
    body('escolas_responsaveis')
      .optional()
      .isString()
      .trim()
      .withMessage('Escolas responsáveis deve ser uma string válida'),
    body('status')
      .optional()
      .isIn(['ativo', 'inativo'])
      .withMessage('Status deve ser "ativo" ou "inativo"'),
    body('observacoes')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Observações deve ter no máximo 1000 caracteres'),
    handleValidationErrors
  ],

  // Validação para atualizar rota nutricionista
  atualizar: [
    body('codigo')
      .optional()
      .isString()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Código deve ter entre 1 e 50 caracteres'),
    body('usuario_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ID do usuário deve ser um número inteiro positivo'),
    body('supervisor_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ID do supervisor deve ser um número inteiro positivo'),
    body('coordenador_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ID do coordenador deve ser um número inteiro positivo'),
    body('escolas_responsaveis')
      .optional()
      .isString()
      .trim()
      .withMessage('Escolas responsáveis deve ser uma string válida'),
    body('status')
      .optional()
      .isIn(['ativo', 'inativo'])
      .withMessage('Status deve ser "ativo" ou "inativo"'),
    body('observacoes')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Observações deve ter no máximo 1000 caracteres'),
    handleValidationErrors
  ],

  // Validação para exportar
  exportar: [
    query('search')
      .optional()
      .isString()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Termo de busca deve ter entre 1 e 100 caracteres'),
    query('status')
      .optional()
      .isIn(['ativo', 'inativo'])
      .withMessage('Status deve ser "ativo" ou "inativo"'),
    handleValidationErrors
  ]
};

module.exports = {
  commonValidations,
  rotasNutricionistasValidations
};

/**
 * Validações específicas para Permissões
 * Implementa validações usando express-validator
 */

const { body, param, query } = require('express-validator');
const { createEntityValidationHandler } = require('../../middleware/validationHandler');

// Criar handler de validação específico para permissões
const handleValidationErrors = createEntityValidationHandler('permissoes');

// Validações comuns
const commonValidations = {
  // Validação de ID numérico
  id: param('id')
    .isInt({ min: 1 })
    .withMessage('ID deve ser um número inteiro positivo'),

  // Validação de ID de usuário
  usuarioId: param('usuarioId')
    .isInt({ min: 1 })
    .withMessage('ID do usuário deve ser um número inteiro positivo'),

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

// Validações específicas para permissões
const permissoesValidations = {
  // Validação para obter permissões padrão
  obterPermissoesPadrao: [
    param('tipoAcesso')
      .isIn(['administrador', 'coordenador', 'administrativo', 'gerente', 'supervisor'])
      .withMessage('Tipo de acesso deve ser: administrador, coordenador, administrativo, gerente ou supervisor'),
    param('nivelAcesso')
      .isIn(['I', 'II', 'III'])
      .withMessage('Nível de acesso deve ser: I, II ou III'),
    handleValidationErrors
  ],

  // Validação para atualizar permissões
  atualizarPermissoes: [
    param('usuarioId')
      .isInt({ min: 1 })
      .withMessage('ID do usuário deve ser um número inteiro positivo'),
    body('permissoes')
      .isArray({ min: 1 })
      .withMessage('Permissões devem ser um array não vazio'),
    body('permissoes.*.tela')
      .isString()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Tela deve ser uma string válida'),
    body('permissoes.*.pode_visualizar')
      .isBoolean()
      .withMessage('pode_visualizar deve ser um booleano'),
    body('permissoes.*.pode_criar')
      .isBoolean()
      .withMessage('pode_criar deve ser um booleano'),
    body('permissoes.*.pode_editar')
      .isBoolean()
      .withMessage('pode_editar deve ser um booleano'),
    body('permissoes.*.pode_excluir')
      .isBoolean()
      .withMessage('pode_excluir deve ser um booleano'),
    handleValidationErrors
  ]
};

module.exports = {
  commonValidations,
  permissoesValidations,
  handleValidationErrors
};

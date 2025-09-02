/**
 * Validações para Permissões
 * Validações usando express-validator
 */

const { param, query, body, validationResult } = require('express-validator');

// Validações comuns
const commonValidations = {
  // Validação de ID numérico
  id: param('id')
    .isInt({ min: 1 })
    .withMessage('ID deve ser um número inteiro positivo'),

  // Validação específica para usuarioId
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
      .isInt({ min: 1, max: 1000 })
      .withMessage('Limite deve ser um número entre 1 e 1000')
  ]
};

// Validações específicas para permissões
const permissoesValidations = {
  // Validação para obter permissões padrão
  obterPermissoesPadrao: [
    param('tipoAcesso')
      .isString()
      .isIn(['administrador', 'coordenador', 'administrativo', 'gerente', 'supervisor'])
      .withMessage('Tipo de acesso deve ser um dos valores válidos'),
    param('nivelAcesso')
      .isString()
      .isIn(['I', 'II', 'III'])
      .withMessage('Nível de acesso deve ser I, II ou III')
  ],

  // Validação para atualizar permissões
  atualizarPermissoes: [
    param('usuarioId')
      .isInt({ min: 1 })
      .withMessage('ID do usuário deve ser um número inteiro positivo'),
    body('permissoes')
      .isArray({ min: 1 })
      .withMessage('Permissões deve ser um array não vazio'),
    body('permissoes.*.tela')
      .isString()
      .isLength({ min: 1, max: 50 })
      .withMessage('Tela deve ser uma string válida'),
    body('permissoes.*.pode_visualizar')
      .optional()
      .isBoolean()
      .withMessage('pode_visualizar deve ser um booleano'),
    body('permissoes.*.pode_criar')
      .optional()
      .isBoolean()
      .withMessage('pode_criar deve ser um booleano'),
    body('permissoes.*.pode_editar')
      .optional()
      .isBoolean()
      .withMessage('pode_editar deve ser um booleano'),
    body('permissoes.*.pode_excluir')
      .optional()
      .isBoolean()
      .withMessage('pode_excluir deve ser um booleano')
  ]
};

// Middleware para capturar erros de validação
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Dados inválidos',
      details: errors.array()
    });
  }
  
  next();
};

module.exports = {
  commonValidations,
  permissoesValidations,
  handleValidationErrors
};

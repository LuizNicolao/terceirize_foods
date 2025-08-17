/**
 * Validações específicas para Usuários
 * Implementa validações usando express-validator com sistema universal
 */

const { body, param, query } = require('express-validator');
const { 
  handleValidationErrors, 
  defaultCategoryMappings, 
  defaultCategoryNames, 
  defaultCategoryIcons 
} = require('../../middleware/validation');

// Configuração específica para usuários
const userCategoryMapping = defaultCategoryMappings.usuarios;
const userCategoryNames = {
  ...defaultCategoryNames,
  personalInfo: 'Informações Pessoais',
  accessInfo: 'Informações de Acesso'
};
const userCategoryIcons = {
  ...defaultCategoryIcons,
  personalInfo: '👤',
  accessInfo: '🔐'
};

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

// Validações específicas para usuários
const userValidations = {
  create: [
    body('nome')
      .isLength({ min: 3, max: 100 })
      .withMessage('Nome deve ter entre 3 e 100 caracteres')
      .trim(),
    body('email')
      .custom((value) => {
        if (value && value.trim() !== '') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            throw new Error('Email deve ser um email válido');
          }
        }
        return true;
      })
      .withMessage('Email deve ser um email válido'),
    body('senha')
      .isLength({ min: 6 })
      .withMessage('Senha deve ter pelo menos 6 caracteres'),
    body('nivel_de_acesso')
      .isIn(['I', 'II', 'III'])
      .withMessage('Nível de acesso deve ser I, II ou III'),
    body('tipo_de_acesso')
      .isIn(['administrador', 'coordenador', 'administrativo', 'gerente', 'supervisor'])
      .withMessage('Tipo de acesso inválido'),
    handleValidationErrors(userCategoryMapping, userCategoryNames, userCategoryIcons)
  ],

  update: [
    commonValidations.id,
    body('nome')
      .optional()
      .isLength({ min: 3, max: 100 })
      .withMessage('Nome deve ter entre 3 e 100 caracteres')
      .trim(),
    body('email')
      .optional()
      .custom((value) => {
        if (value && value.trim() !== '') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            throw new Error('Email deve ser um email válido');
          }
        }
        return true;
      })
      .withMessage('Email deve ser um email válido'),
    body('nivel_de_acesso')
      .optional()
      .isIn(['I', 'II', 'III'])
      .withMessage('Nível de acesso deve ser I, II ou III'),
    body('tipo_de_acesso')
      .optional()
      .isIn(['administrador', 'coordenador', 'administrativo', 'gerente', 'supervisor'])
      .withMessage('Tipo de acesso inválido'),
    body('status')
      .optional()
      .isIn(['ativo', 'inativo'])
      .withMessage('Status deve ser ativo ou inativo'),
    handleValidationErrors(userCategoryMapping, userCategoryNames, userCategoryIcons)
  ],

  updatePassword: [
    commonValidations.id,
    body('senha_atual')
      .isLength({ min: 6 })
      .withMessage('Senha atual deve ter pelo menos 6 caracteres'),
    body('nova_senha')
      .isLength({ min: 6 })
      .withMessage('Nova senha deve ter pelo menos 6 caracteres'),
    body('confirmar_senha')
      .custom((value, { req }) => {
        if (value !== req.body.nova_senha) {
          throw new Error('Confirmação de senha não confere');
        }
        return true;
      })
      .withMessage('Confirmação de senha não confere'),
    handleValidationErrors(userCategoryMapping, userCategoryNames, userCategoryIcons)
  ]
};

module.exports = {
  userValidations,
  commonValidations
}; 
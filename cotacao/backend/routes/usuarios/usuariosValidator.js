/**
 * Validadores para rotas de usuários
 * Implementa validação com express-validator
 */

const { query, param, body, validationResult } = require('express-validator');

// Middleware para capturar erros de validação
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Dados inválidos',
      errors: errors.array()
    });
  }
  next();
};

// Validações para listagem de usuários
const usuariosValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Página deve ser um número maior que 0'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit deve ser um número entre 1 e 100'),
  
  query('search')
    .optional()
    .isString()
    .withMessage('Busca deve ser uma string'),
  
  query('status')
    .optional()
    .isIn(['ativo', 'inativo', 'todos'])
    .withMessage('Status deve ser: ativo, inativo ou todos'),
  
  handleValidationErrors
];

// Validações para usuário específico
const usuarioValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID deve ser um número válido'),
  
  handleValidationErrors
];

// Validações para criação de usuário
const createUsuarioValidation = [
  body('name')
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email deve ser um endereço válido'),
  
  body('password')
    .isString()
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres'),
  
  body('role')
    .isIn(['administrador', 'gestor', 'supervisor', 'comprador'])
    .withMessage('Role deve ser: administrador, gestor, supervisor ou comprador'),
  
  body('status')
    .optional()
    .isIn(['ativo', 'inativo'])
    .withMessage('Status deve ser: ativo ou inativo'),
  
  body('permissions')
    .optional()
    .isArray()
    .withMessage('Permissões deve ser um array'),
  
  body('permissions.*.screen')
    .optional()
    .isString()
    .withMessage('Screen deve ser uma string'),
  
  body('permissions.*.can_view')
    .optional()
    .isBoolean()
    .withMessage('can_view deve ser um valor booleano'),
  
  body('permissions.*.can_create')
    .optional()
    .isBoolean()
    .withMessage('can_create deve ser um valor booleano'),
  
  body('permissions.*.can_edit')
    .optional()
    .isBoolean()
    .withMessage('can_edit deve ser um valor booleano'),
  
  body('permissions.*.can_delete')
    .optional()
    .isBoolean()
    .withMessage('can_delete deve ser um valor booleano'),
  
  handleValidationErrors
];

// Validações para atualização de usuário
const updateUsuarioValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID deve ser um número válido'),
  
  body('name')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres'),
  
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Email deve ser um endereço válido'),
  
  body('password')
    .optional()
    .isString()
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres'),
  
  body('role')
    .optional()
    .isIn(['administrador', 'gestor', 'supervisor', 'comprador'])
    .withMessage('Role deve ser: administrador, gestor, supervisor ou comprador'),
  
  body('status')
    .optional()
    .isIn(['ativo', 'inativo'])
    .withMessage('Status deve ser: ativo ou inativo'),
  
  body('permissions')
    .optional()
    .isArray()
    .withMessage('Permissões deve ser um array'),
  
  handleValidationErrors
];

module.exports = {
  usuariosValidation,
  usuarioValidation,
  createUsuarioValidation,
  updateUsuarioValidation,
  handleValidationErrors
};

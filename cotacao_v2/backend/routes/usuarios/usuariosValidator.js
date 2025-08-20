const { body, param, validationResult } = require('express-validator');

// Middleware para verificar erros de validação
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Dados inválidos',
      errors: errors.array() 
    });
  }
  next();
};

// Validações para criação de usuário
const validateCreateUsuario = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Nome é obrigatório')
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email é obrigatório')
    .isEmail()
    .withMessage('Email deve ser válido')
    .normalizeEmail(),
  
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Senha é obrigatória')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres'),
  
  body('role')
    .trim()
    .notEmpty()
    .withMessage('Tipo de usuário é obrigatório')
    .isIn(['administrador', 'gestor', 'supervisor', 'comprador'])
    .withMessage('Tipo de usuário deve ser: administrador, gestor, supervisor ou comprador'),
  
  body('status')
    .optional()
    .isIn(['ativo', 'inativo'])
    .withMessage('Status deve ser: ativo ou inativo'),
  
  handleValidationErrors
];

// Validações para atualização de usuário
const validateUpdateUsuario = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID do usuário deve ser um número inteiro válido'),
  
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Nome não pode estar vazio')
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres'),
  
  body('email')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Email não pode estar vazio')
    .isEmail()
    .withMessage('Email deve ser válido')
    .normalizeEmail(),
  
  body('role')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Tipo de usuário não pode estar vazio')
    .isIn(['administrador', 'gestor', 'supervisor', 'comprador'])
    .withMessage('Tipo de usuário deve ser: administrador, gestor, supervisor ou comprador'),
  
  body('status')
    .optional()
    .isIn(['ativo', 'inativo'])
    .withMessage('Status deve ser: ativo ou inativo'),
  
  handleValidationErrors
];

// Validações para busca de usuário
const validateGetUsuario = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID do usuário deve ser um número inteiro válido'),
  
  handleValidationErrors
];

// Validações para exclusão de usuário
const validateDeleteUsuario = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID do usuário deve ser um número inteiro válido'),
  
  handleValidationErrors
];

// Validações para alteração de senha
const validateChangePassword = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID do usuário deve ser um número inteiro válido'),
  
  body('currentPassword')
    .trim()
    .notEmpty()
    .withMessage('Senha atual é obrigatória'),
  
  body('newPassword')
    .trim()
    .notEmpty()
    .withMessage('Nova senha é obrigatória')
    .isLength({ min: 6 })
    .withMessage('Nova senha deve ter pelo menos 6 caracteres'),
  
  handleValidationErrors
];

// Validações para permissões
const validateUpdatePermissions = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID do usuário deve ser um número inteiro válido'),
  
  body('permissions')
    .isArray()
    .withMessage('Permissões deve ser um array'),
  
  body('permissions.*.screen')
    .notEmpty()
    .withMessage('Tela é obrigatória para cada permissão'),
  
  body('permissions.*.can_view')
    .isBoolean()
    .withMessage('can_view deve ser um valor booleano'),
  
  body('permissions.*.can_create')
    .isBoolean()
    .withMessage('can_create deve ser um valor booleano'),
  
  body('permissions.*.can_edit')
    .isBoolean()
    .withMessage('can_edit deve ser um valor booleano'),
  
  body('permissions.*.can_delete')
    .isBoolean()
    .withMessage('can_delete deve ser um valor booleano'),
  
  handleValidationErrors
];

// Validações para ativação/desativação
const validateToggleStatus = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID do usuário deve ser um número inteiro válido'),
  
  handleValidationErrors
];

module.exports = {
  validateCreateUsuario,
  validateUpdateUsuario,
  validateGetUsuario,
  validateDeleteUsuario,
  validateChangePassword,
  validateUpdatePermissions,
  validateToggleStatus,
  handleValidationErrors
};

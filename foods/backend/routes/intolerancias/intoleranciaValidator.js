const { body, query, param, validationResult } = require('express-validator');

// Validações comuns
const commonValidations = {
  id: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID deve ser um número inteiro positivo')
  ],
  
  search: [
    query('search')
      .optional()
      .isString()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Termo de busca deve ter entre 1 e 100 caracteres')
  ],
  
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

// Validações para criação de intolerância
const intoleranciaValidations = [
  body('nome')
    .notEmpty()
    .withMessage('Nome é obrigatório')
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
    .withMessage('Nome deve conter apenas letras e espaços'),
  
  body('status')
    .optional()
    .isIn(['ativo', 'inativo'])
    .withMessage('Status deve ser "ativo" ou "inativo"'),
  
  // Middleware para verificar erros de validação
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = {};
      const errorCategories = {};
      
      errors.array().forEach(error => {
        const field = error.path;
        if (!errorMessages[field]) {
          errorMessages[field] = [];
          errorCategories[field] = [];
        }
        errorMessages[field].push(error.msg);
        
        // Categorizar erros
        if (error.msg.includes('obrigatório')) {
          errorCategories[field].push('required');
        } else if (error.msg.includes('caracteres')) {
          errorCategories[field].push('length');
        } else if (error.msg.includes('letras')) {
          errorCategories[field].push('format');
        } else if (error.msg.includes('ativo') || error.msg.includes('inativo')) {
          errorCategories[field].push('enum');
        } else {
          errorCategories[field].push('validation');
        }
      });
      
      return res.status(422).json({
        success: false,
        message: 'Dados inválidos',
        errors: errorMessages,
        errorCategories: errorCategories
      });
    }
    next();
  }
];

// Validações para atualização de intolerância
const intoleranciaAtualizacaoValidations = [
  body('nome')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
    .withMessage('Nome deve conter apenas letras e espaços'),
  
  body('status')
    .optional()
    .isIn(['ativo', 'inativo'])
    .withMessage('Status deve ser "ativo" ou "inativo"'),
  
  // Middleware para verificar erros de validação
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = {};
      const errorCategories = {};
      
      errors.array().forEach(error => {
        const field = error.path;
        if (!errorMessages[field]) {
          errorMessages[field] = [];
          errorCategories[field] = [];
        }
        errorMessages[field].push(error.msg);
        
        // Categorizar erros
        if (error.msg.includes('caracteres')) {
          errorCategories[field].push('length');
        } else if (error.msg.includes('letras')) {
          errorCategories[field].push('format');
        } else if (error.msg.includes('ativo') || error.msg.includes('inativo')) {
          errorCategories[field].push('enum');
        } else {
          errorCategories[field].push('validation');
        }
      });
      
      return res.status(422).json({
        success: false,
        message: 'Dados inválidos',
        errors: errorMessages,
        errorCategories: errorCategories
      });
    }
    next();
  }
];

module.exports = {
  intoleranciaValidations,
  intoleranciaAtualizacaoValidations,
  commonValidations
};

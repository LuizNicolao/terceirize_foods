/**
 * Validações específicas para Produto Origem
 * Implementa validações usando express-validator
 */

const { body, param, query, validationResult } = require('express-validator');
const { validationResponse } = require('../../middleware/responseHandler');

// Middleware para capturar erros de validação
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return validationResponse(res, errors.array());
  }
  next();
};

// Middleware para limpar campos vazios
const cleanEmptyFields = (req, res, next) => {
  // Converter campos vazios para null
  const fieldsToClean = ['grupo_id', 'subgrupo_id', 'classe_id', 'produto_generico_padrao_id', 'peso_liquido', 'referencia_mercado'];
  
  fieldsToClean.forEach(field => {
    if (req.body[field] === '' || req.body[field] === undefined) {
      req.body[field] = null;
    }
  });

  // Converter campos numéricos
  if (req.body.unidade_medida_id && req.body.unidade_medida_id !== '') {
    req.body.unidade_medida_id = parseInt(req.body.unidade_medida_id);
  }
  
  if (req.body.fator_conversao && req.body.fator_conversao !== '') {
    req.body.fator_conversao = parseFloat(req.body.fator_conversao);
  }

  if (req.body.grupo_id && req.body.grupo_id !== '') {
    req.body.grupo_id = parseInt(req.body.grupo_id);
  }

  if (req.body.subgrupo_id && req.body.subgrupo_id !== '') {
    req.body.subgrupo_id = parseInt(req.body.subgrupo_id);
  }

  if (req.body.classe_id && req.body.classe_id !== '') {
    req.body.classe_id = parseInt(req.body.classe_id);
  }

  if (req.body.peso_liquido && req.body.peso_liquido !== '') {
    req.body.peso_liquido = parseFloat(req.body.peso_liquido);
  }

  if (req.body.produto_generico_padrao_id && req.body.produto_generico_padrao_id !== '') {
    req.body.produto_generico_padrao_id = parseInt(req.body.produto_generico_padrao_id);
  }

  next();
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

// Validações específicas para produto origem
const produtoOrigemValidations = {
  create: [
    cleanEmptyFields,
    
    body('codigo')
      .isLength({ min: 1, max: 20 })
      .withMessage('Código deve ter entre 1 e 20 caracteres')
      .matches(/^[a-zA-Z0-9\-_]+$/)
      .withMessage('Código deve conter apenas letras, números, hífens e underscores'),
    
    body('nome')
      .isLength({ min: 3, max: 200 })
      .withMessage('Nome deve ter entre 3 e 200 caracteres'),
    
    body('unidade_medida_id')
      .notEmpty()
      .withMessage('Unidade de medida é obrigatória')
      .isInt({ min: 1 })
      .withMessage('Unidade de medida deve ser selecionada'),
    
    body('fator_conversao')
      .optional()
      .isFloat({ min: 0.001, max: 999999.999 })
      .withMessage('Fator de conversão deve ser um número entre 0.001 e 999999.999'),
    
    body('grupo_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Grupo deve ser selecionado'),
    
    body('subgrupo_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Subgrupo deve ser selecionado'),
    
    body('classe_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Classe deve ser selecionada'),
    
    body('peso_liquido')
      .optional()
      .isFloat({ min: 0.001, max: 999999.999 })
      .withMessage('Peso líquido deve ser um número entre 0.001 e 999999.999'),
    
    body('referencia_mercado')
      .optional()
      .isLength({ min: 1, max: 200 })
      .withMessage('Referência de mercado deve ter entre 1 e 200 caracteres'),
    
    body('produto_generico_padrao_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Produto genérico padrão deve ser selecionado'),
    
    body('status')
      .optional()
      .isIn([0, 1, '0', '1'])
      .withMessage('Status deve ser 0 (inativo) ou 1 (ativo)'),
    
    handleValidationErrors
  ],

  update: [
    cleanEmptyFields,
    
    body('codigo')
      .optional()
      .isLength({ min: 1, max: 20 })
      .withMessage('Código deve ter entre 1 e 20 caracteres')
      .matches(/^[a-zA-Z0-9\-_]+$/)
      .withMessage('Código deve conter apenas letras, números, hífens e underscores'),
    
    body('nome')
      .optional()
      .isLength({ min: 3, max: 200 })
      .withMessage('Nome deve ter entre 3 e 200 caracteres'),
    
    body('unidade_medida_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Unidade de medida deve ser selecionada'),
    
    body('fator_conversao')
      .optional()
      .isFloat({ min: 0.001, max: 999999.999 })
      .withMessage('Fator de conversão deve ser um número entre 0.001 e 999999.999'),
    
    body('grupo_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Grupo deve ser selecionado'),
    
    body('subgrupo_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Subgrupo deve ser selecionado'),
    
    body('classe_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Classe deve ser selecionada'),
    
    body('peso_liquido')
      .optional()
      .isFloat({ min: 0.001, max: 999999.999 })
      .withMessage('Peso líquido deve ser um número entre 0.001 e 999999.999'),
    
    body('referencia_mercado')
      .optional()
      .isLength({ min: 1, max: 200 })
      .withMessage('Referência de mercado deve ter entre 1 e 200 caracteres'),
    
    body('produto_generico_padrao_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Produto genérico padrão deve ser selecionado'),
    
    body('status')
      .optional()
      .isIn([0, 1, '0', '1'])
      .withMessage('Status deve ser 0 (inativo) ou 1 (ativo)'),
    
    handleValidationErrors
  ]
};

module.exports = {
  produtoOrigemValidations,
  commonValidations
};

/**
 * Validações específicas para Produto Comercial
 * Implementa validações usando express-validator
 */

const { body, param, query } = require('express-validator');
const { createEntityValidationHandler } = require('../../middleware/validationHandler');

// Criar handler de validação específico para produto comercial
const handleValidationErrors = createEntityValidationHandler('produto-comercial');

// Middleware para limpar campos vazios
const cleanEmptyFields = (req, res, next) => {
  // Converter campos vazios para null
  const fieldsToClean = ['grupo_id', 'subgrupo_id', 'classe_id'];
  
  fieldsToClean.forEach(field => {
    if (req.body[field] === '' || req.body[field] === undefined || req.body[field] === 'null') {
      req.body[field] = null;
    }
  });

  // Converter campos numéricos
  if (req.body.unidade_medida_id && req.body.unidade_medida_id !== '') {
    req.body.unidade_medida_id = parseInt(req.body.unidade_medida_id);
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

// Validações específicas para produto comercial
const produtoComercialValidations = {
  create: [
    cleanEmptyFields,
    
    body('nome_comercial')
      .isLength({ min: 3, max: 200 })
      .withMessage('Nome comercial deve ter pelo menos 3 caracteres e no máximo 200 caracteres'),
    
    body('unidade_medida_id')
      .notEmpty()
      .withMessage('Unidade de medida é obrigatória')
      .custom((value) => {
        if (!value || value === '' || value === null || value === undefined) {
          throw new Error('Unidade de medida é obrigatória');
        }
        const numValue = parseInt(value);
        if (isNaN(numValue) || numValue < 1) {
          throw new Error('Unidade de medida deve ser um número válido');
        }
        return true;
      })
      .withMessage('Unidade de medida deve ser selecionada'),
    
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
    
    body('status')
      .optional()
      .isIn([0, 1, '0', '1'])
      .withMessage('Status deve ser 0 (inativo) ou 1 (ativo)'),
    
    handleValidationErrors
  ],

  update: [
    cleanEmptyFields,
    
    body('nome_comercial')
      .optional()
      .isLength({ min: 3, max: 200 })
      .withMessage('Nome comercial deve ter entre 3 e 200 caracteres'),
    
    body('unidade_medida_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Unidade de medida deve ser selecionada'),
    
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
    
    body('status')
      .optional()
      .isIn([0, 1, '0', '1'])
      .withMessage('Status deve ser 0 (inativo) ou 1 (ativo)'),
    
    handleValidationErrors
  ]
};

module.exports = {
  produtoComercialValidations,
  commonValidations
};


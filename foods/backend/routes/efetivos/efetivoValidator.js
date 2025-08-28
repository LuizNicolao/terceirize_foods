const { body, param, query } = require('express-validator');

// Validações comuns
const commonValidations = {
  id: [
    param('id').isInt({ min: 1 }).withMessage('ID deve ser um número inteiro positivo')
  ],
  search: [
    query('search').optional().isString().withMessage('Busca deve ser uma string')
  ],
  pagination: [
    query('page').optional().isInt({ min: 1 }).withMessage('Página deve ser um número inteiro positivo'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limite deve ser entre 1 e 100')
  ]
};

// Validações para criação de efetivo
const efetivoValidations = [
  body('unidade_escolar_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID da unidade escolar deve ser um número inteiro positivo'),
  
  body('tipo_efetivo')
    .isIn(['PADRAO', 'NAE'])
    .withMessage('Tipo de efetivo deve ser PADRAO ou NAE'),
  
  body('quantidade')
    .isInt({ min: 1 })
    .withMessage('Quantidade deve ser um número inteiro maior que zero'),
  
  body('intolerancia_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID da intolerância deve ser um número inteiro positivo')
];

// Validações para atualização de efetivo
const efetivoAtualizacaoValidations = [
  body('unidade_escolar_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID da unidade escolar deve ser um número inteiro positivo'),
  
  body('tipo_efetivo')
    .isIn(['PADRAO', 'NAE'])
    .withMessage('Tipo de efetivo deve ser PADRAO ou NAE'),
  
  body('quantidade')
    .isInt({ min: 1 })
    .withMessage('Quantidade deve ser um número inteiro maior que zero'),
  
  body('intolerancia_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID da intolerância deve ser um número inteiro positivo')
];

module.exports = {
  commonValidations,
  efetivoValidations,
  efetivoAtualizacaoValidations
};

/**
 * Validador para Informações Básicas do Produto
 */

const { body } = require('express-validator');

const basicInfoValidations = [
  body('nome')
    .isLength({ min: 3, max: 200 })
    .withMessage('Nome do produto deve ter entre 3 e 200 caracteres'),
  
  body('codigo_produto')
    .optional()
    .isLength({ min: 1, max: 10 })
    .withMessage('Código do produto deve ter entre 1 e 10 caracteres'),
  
  body('codigo_barras')
    .optional()
    .isLength({ min: 8, max: 50 })
    .withMessage('Código de barras deve ter entre 8 e 50 caracteres'),
  
  body('fator_conversao')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Fator de conversão deve ser um número positivo'),
  
  body('status')
    .optional()
    .isIn([0, 1])
    .withMessage('Status deve ser 0 (inativo) ou 1 (ativo)')
];

module.exports = {
  basicInfoValidations
};

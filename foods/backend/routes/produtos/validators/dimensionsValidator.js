/**
 * Validador para Dimensões e Pesos do Produto
 */

const { body } = require('express-validator');

const dimensionsValidations = [
  body('peso_liquido')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Peso líquido deve ser um número positivo'),
  
  body('peso_bruto')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Peso bruto deve ser um número positivo'),
  
  body('comprimento')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Comprimento deve ser um número positivo'),
  
  body('largura')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Largura deve ser um número positivo'),
  
  body('altura')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Altura deve ser um número positivo'),
  
  body('volume')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Volume deve ser um número positivo'),
  
  body('regra_palet_un')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Regra palet deve ser um número inteiro positivo')
];

module.exports = {
  dimensionsValidations
};

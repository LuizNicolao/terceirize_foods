/**
 * Validador para Tributação do Produto
 */

const { body } = require('express-validator');

const taxationValidations = [
  body('ncm')
    .optional()
    .isLength({ min: 1, max: 10 })
    .withMessage('NCM deve ter entre 1 e 10 caracteres'),
  
  body('cest')
    .optional()
    .isLength({ min: 1, max: 10 })
    .withMessage('CEST deve ter entre 1 e 10 caracteres'),
  
  body('cfop')
    .optional()
    .isLength({ min: 1, max: 10 })
    .withMessage('CFOP deve ter entre 1 e 10 caracteres'),
  
  body('ean')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('EAN deve ter entre 1 e 50 caracteres'),
  
  body('cst_icms')
    .optional()
    .isLength({ min: 1, max: 3 })
    .withMessage('CST ICMS deve ter entre 1 e 3 caracteres'),
  
  body('csosn')
    .optional()
    .isLength({ min: 1, max: 3 })
    .withMessage('CSOSN deve ter entre 1 e 3 caracteres'),
  
  body('aliquota_icms')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Alíquota ICMS deve ser um número entre 0 e 100'),
  
  body('aliquota_ipi')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Alíquota IPI deve ser um número entre 0 e 100'),
  
  body('aliquota_pis')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Alíquota PIS deve ser um número entre 0 e 100'),
  
  body('aliquota_cofins')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Alíquota COFINS deve ser um número entre 0 e 100')
];

module.exports = {
  taxationValidations
};

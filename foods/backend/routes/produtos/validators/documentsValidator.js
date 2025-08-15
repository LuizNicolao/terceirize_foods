/**
 * Validador para Documentos e Registros do Produto
 */

const { body } = require('express-validator');

const documentsValidations = [
  body('ficha_homologacao')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Ficha de homologação deve ter entre 1 e 50 caracteres'),
  
  body('registro_especifico')
    .optional()
    .isLength({ min: 1, max: 200 })
    .withMessage('Registro específico deve ter entre 1 e 200 caracteres'),
  
  body('tipo_registro')
    .optional()
    .isIn(['ANVISA', 'MAPA', 'OUTROS'])
    .withMessage('Tipo de registro deve ser ANVISA, MAPA ou OUTROS'),
  
  body('prazo_validade')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Prazo de validade deve ser um número inteiro positivo'),
  
  body('unidade_validade')
    .optional()
    .isIn(['DIAS', 'SEMANAS', 'MESES', 'ANOS'])
    .withMessage('Unidade de validade deve ser DIAS, SEMANAS, MESES ou ANOS')
];

module.exports = {
  documentsValidations
};

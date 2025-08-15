/**
 * Validador para Classificação do Produto
 */

const { body } = require('express-validator');

const classificationValidations = [
  body('unidade_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Unidade deve ser selecionada'),
  
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
  
  body('nome_generico_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Produto genérico deve ser selecionado'),
  
  body('produto_origem_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Produto origem deve ser selecionado'),
  
  body('marca_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Marca deve ser selecionada')
];

module.exports = {
  classificationValidations
};

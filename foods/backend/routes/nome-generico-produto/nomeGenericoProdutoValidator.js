const { body } = require('express-validator');

const nomeGenericoProdutoValidations = {
  criar: [
    body('nome')
      .notEmpty()
      .withMessage('Nome é obrigatório')
      .isLength({ min: 2, max: 200 })
      .withMessage('Nome deve ter entre 2 e 200 caracteres'),
    
    body('grupo_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ID do grupo deve ser um número inteiro válido'),
    
    body('subgrupo_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ID do subgrupo deve ser um número inteiro válido'),
    
    body('classe_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ID da classe deve ser um número inteiro válido'),
    
    body('status')
      .optional()
      .isIn(['ativo', 'inativo'])
      .withMessage('Status deve ser "ativo" ou "inativo"')
  ],

  atualizar: [
    body('nome')
      .optional()
      .isLength({ min: 2, max: 200 })
      .withMessage('Nome deve ter entre 2 e 200 caracteres'),
    
    body('grupo_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ID do grupo deve ser um número inteiro válido'),
    
    body('subgrupo_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ID do subgrupo deve ser um número inteiro válido'),
    
    body('classe_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ID da classe deve ser um número inteiro válido'),
    
    body('status')
      .optional()
      .isIn(['ativo', 'inativo'])
      .withMessage('Status deve ser "ativo" ou "inativo"')
  ]
};

module.exports = nomeGenericoProdutoValidations;

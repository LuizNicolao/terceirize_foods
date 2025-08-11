const { body, param } = require('express-validator');
const { handleValidationErrors } = require('../../middleware/validation');

const ajudanteValidator = {
  buscar: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID deve ser um número inteiro positivo'),
    handleValidationErrors
  ],

  criar: [
    body('nome')
      .notEmpty()
      .withMessage('Nome é obrigatório')
      .isLength({ min: 3, max: 100 })
      .withMessage('Nome deve ter entre 3 e 100 caracteres')
      .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
      .withMessage('Nome contém caracteres inválidos')
      .trim(),
    
    body('cpf')
      .optional()
      .isLength({ max: 14 })
      .withMessage('CPF deve ter no máximo 14 caracteres')
      .trim(),
    
    body('telefone')
      .optional()
      .isLength({ max: 20 })
      .withMessage('Telefone deve ter no máximo 20 caracteres')
      .trim(),
    
    body('email')
      .optional()
      .isEmail()
      .withMessage('Email deve ser válido')
      .isLength({ max: 100 })
      .withMessage('Email deve ter no máximo 100 caracteres')
      .trim(),
    
    body('endereco')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Endereço deve ter no máximo 500 caracteres')
      .trim(),
    
    body('status')
      .optional()
      .isIn(['ativo', 'inativo', 'ferias', 'licenca'])
      .withMessage('Status deve ser ativo, inativo, ferias ou licenca'),
    
    body('data_admissao')
      .optional()
      .isString()
      .withMessage('Data de admissão deve ser uma string válida'),
    
    body('observacoes')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Observações deve ter no máximo 1000 caracteres')
      .trim(),
    
    body('filial_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ID da filial deve ser um número inteiro válido'),
    
    handleValidationErrors
  ],

  atualizar: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID deve ser um número inteiro positivo'),
    
    body('nome')
      .optional()
      .isLength({ min: 3, max: 100 })
      .withMessage('Nome deve ter entre 3 e 100 caracteres')
      .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
      .withMessage('Nome contém caracteres inválidos')
      .trim(),
    
    body('cpf')
      .optional()
      .isLength({ max: 14 })
      .withMessage('CPF deve ter no máximo 14 caracteres')
      .trim(),
    
    body('telefone')
      .optional()
      .isLength({ max: 20 })
      .withMessage('Telefone deve ter no máximo 20 caracteres')
      .trim(),
    
    body('email')
      .optional()
      .isEmail()
      .withMessage('Email deve ser válido')
      .isLength({ max: 100 })
      .withMessage('Email deve ter no máximo 100 caracteres')
      .trim(),
    
    body('endereco')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Endereço deve ter no máximo 500 caracteres')
      .trim(),
    
    body('status')
      .optional()
      .isIn(['ativo', 'inativo', 'ferias', 'licenca'])
      .withMessage('Status deve ser ativo, inativo, ferias ou licenca'),
    
    body('data_admissao')
      .optional()
      .isString()
      .withMessage('Data de admissão deve ser uma string válida'),
    
    body('observacoes')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Observações deve ter no máximo 1000 caracteres')
      .trim(),
    
    body('filial_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ID da filial deve ser um número inteiro válido'),
    
    handleValidationErrors
  ],

  excluir: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID deve ser um número inteiro positivo'),
    handleValidationErrors
  ]
};

module.exports = { ajudanteValidator };

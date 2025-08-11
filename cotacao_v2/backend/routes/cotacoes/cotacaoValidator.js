const { body, param, query } = require('express-validator');

const validateCreateCotacao = [
  body('comprador')
    .notEmpty()
    .withMessage('Comprador é obrigatório')
    .isLength({ min: 2, max: 100 })
    .withMessage('Comprador deve ter entre 2 e 100 caracteres'),
  
  body('local_entrega')
    .notEmpty()
    .withMessage('Local de entrega é obrigatório')
    .isLength({ min: 2, max: 200 })
    .withMessage('Local de entrega deve ter entre 2 e 200 caracteres'),
  
  body('tipo_compra')
    .notEmpty()
    .withMessage('Tipo de compra é obrigatório')
    .isIn(['normal', 'emergencial'])
    .withMessage('Tipo de compra deve ser "normal" ou "emergencial"'),
  
  body('motivo_emergencial')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Motivo emergencial deve ter no máximo 500 caracteres'),
  
  body('justificativa')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Justificativa deve ter no máximo 1000 caracteres'),
  
  body('produtos')
    .optional()
    .isArray()
    .withMessage('Produtos deve ser um array'),
  
  body('produtos.*.nome')
    .optional()
    .notEmpty()
    .withMessage('Nome do produto é obrigatório')
    .isLength({ min: 2, max: 200 })
    .withMessage('Nome do produto deve ter entre 2 e 200 caracteres'),
  
  body('produtos.*.qtde')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Quantidade deve ser um número positivo'),
  
  body('produtos.*.un')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Unidade deve ter no máximo 20 caracteres'),
  
  body('produtos.*.valor_unitario')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Valor unitário deve ser um número positivo')
];

const validateUpdateCotacao = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID deve ser um número inteiro positivo'),
  
  body('comprador')
    .optional()
    .notEmpty()
    .withMessage('Comprador não pode estar vazio')
    .isLength({ min: 2, max: 100 })
    .withMessage('Comprador deve ter entre 2 e 100 caracteres'),
  
  body('local_entrega')
    .optional()
    .notEmpty()
    .withMessage('Local de entrega não pode estar vazio')
    .isLength({ min: 2, max: 200 })
    .withMessage('Local de entrega deve ter entre 2 e 200 caracteres'),
  
  body('tipo_compra')
    .optional()
    .isIn(['normal', 'emergencial'])
    .withMessage('Tipo de compra deve ser "normal" ou "emergencial"'),
  
  body('motivo_emergencial')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Motivo emergencial deve ter no máximo 500 caracteres'),
  
  body('justificativa')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Justificativa deve ter no máximo 1000 caracteres')
];

const validateGetCotacoes = [
  query('status')
    .optional()
    .isIn(['pendente', 'aprovada', 'rejeitada', 'em_analise'])
    .withMessage('Status deve ser um dos valores válidos'),
  
  query('comprador')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Comprador deve ter no máximo 100 caracteres'),
  
  query('tipoCompra')
    .optional()
    .isIn(['normal', 'emergencial'])
    .withMessage('Tipo de compra deve ser "normal" ou "emergencial"'),
  
  query('dataInicio')
    .optional()
    .isISO8601()
    .withMessage('Data início deve ser uma data válida'),
  
  query('dataFim')
    .optional()
    .isISO8601()
    .withMessage('Data fim deve ser uma data válida')
];

const validateCotacaoId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID deve ser um número inteiro positivo')
];

const validateAprovarCotacao = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID deve ser um número inteiro positivo'),
  
  body('dadosAprovacao.motivo')
    .notEmpty()
    .withMessage('Motivo da aprovação é obrigatório')
    .isLength({ max: 500 })
    .withMessage('Motivo deve ter no máximo 500 caracteres'),
  
  body('dadosAprovacao.economiaTotal')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Economia total deve ser um número positivo')
];

const validateRejeitarCotacao = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID deve ser um número inteiro positivo'),
  
  body('motivo')
    .notEmpty()
    .withMessage('Motivo da rejeição é obrigatório')
    .isLength({ max: 500 })
    .withMessage('Motivo deve ter no máximo 500 caracteres')
];

module.exports = {
  validateCreateCotacao,
  validateUpdateCotacao,
  validateGetCotacoes,
  validateCotacaoId,
  validateAprovarCotacao,
  validateRejeitarCotacao
};

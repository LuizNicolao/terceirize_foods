const { body, param, query } = require('express-validator');

// Validações comuns
const commonValidations = {
  id: param('id').isInt({ min: 1 }).withMessage('ID deve ser um número inteiro positivo'),
  search: query('search').optional().isLength({ max: 100 }).withMessage('Busca deve ter no máximo 100 caracteres'),
  pagination: [
    query('page').optional().isInt({ min: 1 }).withMessage('Página deve ser um número inteiro positivo'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limite deve ser um número entre 1 e 100')
  ]
};

// Validações específicas de periodicidade
const periodicidadeValidations = {
  criarAgrupamento: [
    body('nome').notEmpty().withMessage('Nome é obrigatório').isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres'),
    body('descricao').optional().isLength({ max: 500 }).withMessage('Descrição deve ter no máximo 500 caracteres'),
    body('tipo_id').isInt({ min: 1 }).withMessage('Tipo de periodicidade é obrigatório e deve ser um ID válido'),
    body('regras_calendario').optional().isObject().withMessage('Regras do calendário devem ser um objeto válido'),
    body('ativo').optional().isBoolean().withMessage('Ativo deve ser um valor booleano'),
    body('unidades_escolares').optional().isArray().withMessage('Unidades escolares devem ser um array'),
    body('unidades_escolares.*').optional().isInt({ min: 1 }).withMessage('Cada unidade escolar deve ser um ID válido'),
    body('grupos_produtos').optional().isArray().withMessage('Grupos de produtos devem ser um array'),
    body('grupos_produtos.*').optional().isInt({ min: 1 }).withMessage('Cada grupo de produto deve ser um ID válido'),
    body('produtos_individuais').optional().isArray().withMessage('Produtos individuais devem ser um array'),
    body('produtos_individuais.*').optional().isInt({ min: 1 }).withMessage('Cada produto individual deve ser um ID válido')
  ],
  
  atualizarAgrupamento: [
    param('id').isInt({ min: 1 }).withMessage('ID deve ser um número inteiro positivo'),
    body('nome').optional().isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres'),
    body('descricao').optional().isLength({ max: 500 }).withMessage('Descrição deve ter no máximo 500 caracteres'),
    body('tipo_id').optional().isInt({ min: 1 }).withMessage('Tipo de periodicidade deve ser um ID válido'),
    body('regras_calendario').optional().isObject().withMessage('Regras do calendário devem ser um objeto válido'),
    body('ativo').optional().isBoolean().withMessage('Ativo deve ser um valor booleano'),
    body('unidades_escolares').optional().isArray().withMessage('Unidades escolares devem ser um array'),
    body('unidades_escolares.*').optional().isInt({ min: 1 }).withMessage('Cada unidade escolar deve ser um ID válido'),
    body('grupos_produtos').optional().isArray().withMessage('Grupos de produtos devem ser um array'),
    body('grupos_produtos.*').optional().isInt({ min: 1 }).withMessage('Cada grupo de produto deve ser um ID válido'),
    body('produtos_individuais').optional().isArray().withMessage('Produtos individuais devem ser um array'),
    body('produtos_individuais.*').optional().isInt({ min: 1 }).withMessage('Cada produto individual deve ser um ID válido')
  ]
};

module.exports = {
  commonValidations,
  periodicidadeValidations
};

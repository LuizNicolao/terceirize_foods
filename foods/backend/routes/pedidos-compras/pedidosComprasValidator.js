/**
 * Validações específicas para Pedidos de Compras
 * Implementa validações usando express-validator
 */

const { body, param, query } = require('express-validator');
const { createEntityValidationHandler } = require('../../middleware/validationHandler');

// Criar handler de validação específico para pedidos de compras
const handleValidationErrors = createEntityValidationHandler('pedidos-compras');

// Validações comuns
const commonValidations = {
  // Validação de ID numérico
  id: param('id')
    .isInt({ min: 1 })
    .withMessage('ID deve ser um número inteiro positivo'),

  // Validação de busca
  search: query('search')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Termo de busca deve ter entre 1 e 100 caracteres'),

  // Validação de paginação
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Página deve ser um número inteiro positivo'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limite deve ser um número entre 1 e 100')
  ]
};

// Validações específicas para Pedidos de Compras
const pedidosComprasValidations = {
  create: [
    body('solicitacao_compras_id')
      .notEmpty()
      .withMessage('A solicitação de compras é obrigatória')
      .isInt({ min: 1 })
      .withMessage('ID da solicitação deve ser um número inteiro positivo'),
    body('fornecedor_nome')
      .trim()
      .notEmpty()
      .withMessage('O nome do fornecedor é obrigatório')
      .isLength({ min: 1, max: 200 })
      .withMessage('O nome do fornecedor deve ter entre 1 e 200 caracteres'),
    body('fornecedor_cnpj')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 18 })
      .withMessage('O CNPJ deve ter no máximo 18 caracteres'),
    body('itens')
      .isArray({ min: 1 })
      .withMessage('É necessário adicionar pelo menos um item ao pedido'),
    body('itens.*.solicitacao_item_id')
      .notEmpty()
      .withMessage('ID do item da solicitação é obrigatório')
      .isInt({ min: 1 })
      .withMessage('ID do item deve ser um número inteiro positivo'),
    body('itens.*.quantidade_pedido')
      .notEmpty()
      .withMessage('Quantidade do pedido é obrigatória')
      .isFloat({ min: 0.001 })
      .withMessage('Quantidade deve ser maior que zero'),
    body('itens.*.valor_unitario')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Valor unitário deve ser um número positivo'),
    handleValidationErrors
  ],

  update: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID deve ser um número inteiro positivo'),
    body('fornecedor_nome')
      .optional()
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('O nome do fornecedor deve ter entre 1 e 200 caracteres'),
    body('fornecedor_cnpj')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 18 })
      .withMessage('O CNPJ deve ter no máximo 18 caracteres'),
    body('status')
      .optional()
      .isIn(['em_digitacao', 'aprovado', 'enviado', 'confirmado', 'em_transito', 'entregue', 'cancelado'])
      .withMessage('Status inválido'),
    handleValidationErrors
  ]
};

module.exports = {
  pedidosComprasValidations,
  commonValidations,
  handleValidationErrors
};


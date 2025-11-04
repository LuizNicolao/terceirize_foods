/**
 * Validações específicas para Solicitações de Compras
 * Implementa validações usando express-validator
 */

const { body, param, query } = require('express-validator');
const { createEntityValidationHandler } = require('../../middleware/validationHandler');

// Criar handler de validação específico para solicitações de compras
const handleValidationErrors = createEntityValidationHandler('solicitacoes-compras');

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

// Validações específicas para Solicitações de Compras
const solicitacoesComprasValidations = {
  create: [
    body('filial_id')
      .isInt({ min: 1 })
      .withMessage('Filial é obrigatória e deve ser um ID válido'),
    body('data_entrega_cd')
      .isISO8601()
      .withMessage('Data de entrega CD deve ser uma data válida (formato ISO)')
      .toDate(),
    body('motivo')
      .isIn(['Compra Emergencial', 'Compra Programada'])
      .withMessage('Motivo deve ser "Compra Emergencial" ou "Compra Programada"'),
    body('observacoes')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Observações devem ter no máximo 1000 caracteres'),
    body('itens')
      .isArray({ min: 1 })
      .withMessage('A solicitação deve ter pelo menos um item'),
    body('itens.*.produto_id')
      .isInt({ min: 1 })
      .withMessage('Cada item deve ter um produto_id válido'),
    body('itens.*.quantidade')
      .isFloat({ min: 0.001 })
      .withMessage('Cada item deve ter uma quantidade maior que zero'),
    body('itens.*.unidade_medida_id')
      .isInt({ min: 1 })
      .withMessage('Cada item deve ter uma unidade_medida_id válida'),
    body('itens.*.observacao')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Observação do item deve ter no máximo 500 caracteres'),
    handleValidationErrors
  ],

  update: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID deve ser um número inteiro positivo'),
    body('filial_id')
      .isInt({ min: 1 })
      .withMessage('Filial é obrigatória e deve ser um ID válido'),
    body('data_entrega_cd')
      .isISO8601()
      .withMessage('Data de entrega CD deve ser uma data válida (formato ISO)')
      .toDate(),
    body('motivo')
      .isIn(['Compra Emergencial', 'Compra Programada'])
      .withMessage('Motivo deve ser "Compra Emergencial" ou "Compra Programada"'),
    body('observacoes')
      .custom((value, { req }) => {
        // Se motivo for "Compra Programada", observações são obrigatórias
        if (req.body.motivo && req.body.motivo !== 'Compra Emergencial') {
          if (!value || value.trim() === '') {
            throw new Error('Observações são obrigatórias para Compra Programada');
          }
        }
        return true;
      })
      .optional()
      .isString()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Observações devem ter no máximo 1000 caracteres'),
    body('itens')
      .isArray({ min: 1 })
      .withMessage('A solicitação deve ter pelo menos um item'),
    body('itens.*.produto_id')
      .isInt({ min: 1 })
      .withMessage('Cada item deve ter um produto_id válido'),
    body('itens.*.quantidade')
      .isFloat({ min: 0.001 })
      .withMessage('Cada item deve ter uma quantidade maior que zero'),
    body('itens.*.unidade_medida_id')
      .isInt({ min: 1 })
      .withMessage('Cada item deve ter uma unidade_medida_id válida'),
    body('itens.*.observacao')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Observação do item deve ter no máximo 500 caracteres'),
    handleValidationErrors
  ]
};

module.exports = {
  solicitacoesComprasValidations,
  commonValidations,
  handleValidationErrors
};


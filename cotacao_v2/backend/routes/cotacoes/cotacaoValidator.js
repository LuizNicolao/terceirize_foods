/**
 * Validador para Cotações
 * Implementa validações específicas para operações de cotações
 */

const { body, param, query } = require('express-validator');
const { commonValidations } = require('../../middleware/validation');

// Validações para criação de cotação
const criarCotacaoValidation = [
  body('comprador')
    .isInt({ min: 1 })
    .withMessage('Comprador deve ser um ID válido'),

  body('local_entrega')
    .isLength({ min: 3, max: 200 })
    .withMessage('Local de entrega deve ter entre 3 e 200 caracteres')
    .trim(),

  body('tipo_compra')
    .isIn(['normal', 'emergencial', 'urgente'])
    .withMessage('Tipo de compra deve ser normal, emergencial ou urgente'),

  body('motivo_emergencial')
    .optional()
    .isLength({ min: 10, max: 500 })
    .withMessage('Motivo emergencial deve ter entre 10 e 500 caracteres')
    .trim(),

  body('justificativa')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Justificativa deve ter entre 10 e 1000 caracteres')
    .trim(),

  body('motivo_final')
    .optional()
    .isLength({ min: 10, max: 500 })
    .withMessage('Motivo final deve ter entre 10 e 500 caracteres')
    .trim(),

  body('produtos')
    .isArray({ min: 1 })
    .withMessage('É necessário pelo menos um produto'),

  body('produtos.*.nome')
    .isLength({ min: 2, max: 200 })
    .withMessage('Nome do produto deve ter entre 2 e 200 caracteres')
    .trim(),

  body('produtos.*.qtde')
    .isFloat({ min: 0.01 })
    .withMessage('Quantidade deve ser um número positivo'),

  body('produtos.*.un')
    .isLength({ min: 1, max: 10 })
    .withMessage('Unidade deve ter entre 1 e 10 caracteres')
    .trim(),

  body('produtos.*.prazoEntrega')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Prazo de entrega deve ser um número inteiro positivo'),

  body('produtos.*.valorUnitario')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Valor unitário deve ser um número positivo'),

  body('produtos.*.difal')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('DIFAL deve ser um número positivo'),

  body('produtos.*.ipi')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('IPI deve ser um número positivo'),

  body('fornecedores')
    .optional()
    .isArray()
    .withMessage('Fornecedores deve ser um array'),

  body('fornecedores.*.nome')
    .optional()
    .isLength({ min: 2, max: 200 })
    .withMessage('Nome do fornecedor deve ter entre 2 e 200 caracteres')
    .trim(),

  body('fornecedores.*.cnpj')
    .optional()
    .custom((value) => {
      if (value && value.trim() !== '') {
        const cnpjLimpo = value.replace(/\D/g, '');
        if (cnpjLimpo.length !== 14) {
          throw new Error('CNPJ deve ter 14 dígitos');
        }
      }
      return true;
    })
    .withMessage('CNPJ deve ter 14 dígitos'),

  body('fornecedores.*.telefone')
    .optional()
    .custom((value) => {
      if (value && value.trim() !== '') {
        const telefoneLimpo = value.replace(/\D/g, '');
        if (telefoneLimpo.length < 8 || telefoneLimpo.length > 15) {
          throw new Error('Telefone deve ter entre 8 e 15 dígitos');
        }
      }
      return true;
    })
    .withMessage('Telefone deve ter entre 8 e 15 dígitos'),

  body('fornecedores.*.email')
    .optional()
    .isEmail()
    .withMessage('Email deve ser um email válido')
];

// Validações para atualização de cotação
const atualizarCotacaoValidation = [
  commonValidations.id,

  body('comprador')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Comprador deve ser um ID válido'),

  body('local_entrega')
    .optional()
    .isLength({ min: 3, max: 200 })
    .withMessage('Local de entrega deve ter entre 3 e 200 caracteres')
    .trim(),

  body('tipo_compra')
    .optional()
    .isIn(['normal', 'emergencial', 'urgente'])
    .withMessage('Tipo de compra deve ser normal, emergencial ou urgente'),

  body('status')
    .optional()
    .isIn(['pendente', 'em_analise', 'aprovada', 'rejeitada', 'cancelada'])
    .withMessage('Status deve ser pendente, em_analise, aprovada, rejeitada ou cancelada'),

  body('motivo_emergencial')
    .optional()
    .isLength({ min: 10, max: 500 })
    .withMessage('Motivo emergencial deve ter entre 10 e 500 caracteres')
    .trim(),

  body('justificativa')
    .optional()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Justificativa deve ter entre 10 e 1000 caracteres')
    .trim(),

  body('motivo_final')
    .optional()
    .isLength({ min: 10, max: 500 })
    .withMessage('Motivo final deve ter entre 10 e 500 caracteres')
    .trim(),

  body('produtos')
    .optional()
    .isArray({ min: 1 })
    .withMessage('É necessário pelo menos um produto'),

  body('produtos.*.nome')
    .optional()
    .isLength({ min: 2, max: 200 })
    .withMessage('Nome do produto deve ter entre 2 e 200 caracteres')
    .trim(),

  body('produtos.*.qtde')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Quantidade deve ser um número positivo'),

  body('produtos.*.un')
    .optional()
    .isLength({ min: 1, max: 10 })
    .withMessage('Unidade deve ter entre 1 e 10 caracteres')
    .trim(),

  body('produtos.*.prazoEntrega')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Prazo de entrega deve ser um número inteiro positivo'),

  body('produtos.*.valorUnitario')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Valor unitário deve ser um número positivo'),

  body('produtos.*.difal')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('DIFAL deve ser um número positivo'),

  body('produtos.*.ipi')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('IPI deve ser um número positivo'),

  body('fornecedores')
    .optional()
    .isArray()
    .withMessage('Fornecedores deve ser um array'),

  body('fornecedores.*.nome')
    .optional()
    .isLength({ min: 2, max: 200 })
    .withMessage('Nome do fornecedor deve ter entre 2 e 200 caracteres')
    .trim(),

  body('fornecedores.*.cnpj')
    .optional()
    .custom((value) => {
      if (value && value.trim() !== '') {
        const cnpjLimpo = value.replace(/\D/g, '');
        if (cnpjLimpo.length !== 14) {
          throw new Error('CNPJ deve ter 14 dígitos');
        }
      }
      return true;
    })
    .withMessage('CNPJ deve ter 14 dígitos'),

  body('fornecedores.*.telefone')
    .optional()
    .custom((value) => {
      if (value && value.trim() !== '') {
        const telefoneLimpo = value.replace(/\D/g, '');
        if (telefoneLimpo.length < 8 || telefoneLimpo.length > 15) {
          throw new Error('Telefone deve ter entre 8 e 15 dígitos');
        }
      }
      return true;
    })
    .withMessage('Telefone deve ter entre 8 e 15 dígitos'),

  body('fornecedores.*.email')
    .optional()
    .isEmail()
    .withMessage('Email deve ser um email válido')
];

// Validações para listagem
const listarCotacoesValidation = [
  ...commonValidations.pagination,
  commonValidations.search,

  query('status')
    .optional()
    .isIn(['pendente', 'em_analise', 'aprovada', 'rejeitada', 'cancelada'])
    .withMessage('Status deve ser pendente, em_analise, aprovada, rejeitada ou cancelada'),

  query('comprador')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Comprador deve ser um ID válido'),

  query('tipo_compra')
    .optional()
    .isIn(['normal', 'emergencial', 'urgente'])
    .withMessage('Tipo de compra deve ser normal, emergencial ou urgente'),

  query('data_inicio')
    .optional()
    .isISO8601()
    .withMessage('Data de início deve ser uma data válida'),

  query('data_fim')
    .optional()
    .isISO8601()
    .withMessage('Data de fim deve ser uma data válida')
];

// Validações para exclusão
const excluirCotacaoValidation = [
  commonValidations.id
];

module.exports = {
  criarCotacaoValidation,
  atualizarCotacaoValidation,
  listarCotacoesValidation,
  excluirCotacaoValidation
};

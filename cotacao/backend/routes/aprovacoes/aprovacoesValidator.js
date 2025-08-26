/**
 * Validações para rotas de Aprovações
 * Implementa validações usando express-validator
 */

const { body, query, param, validationResult } = require('express-validator');

// Middleware para verificar erros de validação
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors: errors.array()
    });
  }
  next();
};

// Validação para listar aprovações
const aprovacoesValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Página deve ser um número inteiro positivo'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limite deve ser entre 1 e 100'),
  query('search').optional().isString().trim().isLength({ max: 100 }).withMessage('Busca deve ter no máximo 100 caracteres'),
  query('status').optional().isIn(['aguardando_aprovacao', 'aprovada', 'rejeitada', 'renegociacao']).withMessage('Status inválido'),
  query('tipo').optional().isIn(['programada', 'emergencial', 'tag']).withMessage('Tipo inválido'),
  query('comprador').optional().isString().trim().isLength({ max: 100 }).withMessage('Comprador deve ter no máximo 100 caracteres'),
  query('dataInicio').optional().isISO8601().withMessage('Data de início deve ser uma data válida'),
  query('dataFim').optional().isISO8601().withMessage('Data de fim deve ser uma data válida'),
  handleValidationErrors
];

// Validação para buscar aprovação específica
const aprovacaoValidation = [
  param('id').isInt({ min: 1 }).withMessage('ID deve ser um número inteiro positivo'),
  handleValidationErrors
];

// Validação para aprovar cotação
const aprovarCotacaoValidation = [
  body('motivo_aprovacao').isString().trim().isLength({ min: 1, max: 500 }).withMessage('Motivo da aprovação é obrigatório e deve ter entre 1 e 500 caracteres'),
  body('itens_aprovados').isArray({ min: 1 }).withMessage('Deve selecionar pelo menos um item para aprovação'),
  body('itens_aprovados.*.produto_id').isString().trim().isLength({ min: 1, max: 200 }).withMessage('ID do produto é obrigatório'),
  body('itens_aprovados.*.fornecedor_nome').isString().trim().isLength({ min: 1, max: 100 }).withMessage('Nome do fornecedor é obrigatório'),
  body('itens_aprovados.*.produto_nome').isString().trim().isLength({ min: 1, max: 255 }).withMessage('Nome do produto é obrigatório'),
  body('itens_aprovados.*.valor_unitario').isFloat({ min: 0 }).withMessage('Valor unitário deve ser um número positivo'),
  body('itens_aprovados.*.quantidade').optional().isFloat({ min: 0 }).withMessage('Quantidade deve ser um número positivo'),
  body('tipo_aprovacao').optional().isIn(['manual', 'melhor-preco', 'melhor-prazo-entrega', 'melhor-prazo-pagamento']).withMessage('Tipo de aprovação inválido'),
  handleValidationErrors
];

// Validação para rejeitar cotação
const rejeitarCotacaoValidation = [
  body('motivo_rejeicao').isString().trim().isLength({ min: 1, max: 500 }).withMessage('Motivo da rejeição é obrigatório e deve ter entre 1 e 500 caracteres'),
  handleValidationErrors
];

// Debug: verificar se os validators foram criados (comentado para limpeza)
// console.log('📦 Validators criados:', !!aprovacoesValidation, !!aprovacaoValidation, !!aprovarCotacaoValidation, !!rejeitarCotacaoValidation);

module.exports = {
  aprovacoesValidation,
  aprovacaoValidation,
  aprovarCotacaoValidation,
  rejeitarCotacaoValidation
};

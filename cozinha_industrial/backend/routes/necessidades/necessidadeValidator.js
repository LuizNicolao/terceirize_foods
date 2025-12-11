const { body, query, param } = require('express-validator');
const { createEntityValidationHandler } = require('../../middleware/validationHandler');

/**
 * Validadores para rotas de Necessidades
 */

// Criar handler de validação específico para necessidades
const handleValidationErrors = createEntityValidationHandler('necessidades');

// Validações comuns
const commonValidations = {
  id: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID deve ser um número inteiro positivo')
  ],
  search: [
    query('search')
      .optional()
      .isString()
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('Busca deve ter entre 1 e 200 caracteres')
  ],
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Página deve ser um número inteiro positivo'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limite deve ser um número entre 1 e 100')
  ],
  sort: [
    query('sortField')
      .optional()
      .isIn(['id', 'codigo', 'filial_nome', 'centro_custo_nome', 'contrato_nome', 'cardapio_nome', 'mes_ref', 'ano', 'total_cozinhas', 'total_itens', 'criado_em'])
      .withMessage('Campo de ordenação inválido'),
    query('sortDirection')
      .optional()
      .isIn(['ASC', 'DESC'])
      .withMessage('Direção de ordenação deve ser ASC ou DESC')
  ]
};

// Validações específicas de necessidades
const necessidadesValidations = {
  // Validações para geração
  gerar: [
    body('filial_id')
      .notEmpty().withMessage('filial_id é obrigatório')
      .isInt({ min: 1 }).withMessage('filial_id deve ser um número inteiro positivo'),
    body('centro_custo_id')
      .notEmpty().withMessage('centro_custo_id é obrigatório')
      .isInt({ min: 1 }).withMessage('centro_custo_id deve ser um número inteiro positivo'),
    body('contrato_id')
      .notEmpty().withMessage('contrato_id é obrigatório')
      .isInt({ min: 1 }).withMessage('contrato_id deve ser um número inteiro positivo'),
    body('cardapio_id')
      .notEmpty().withMessage('cardapio_id é obrigatório')
      .isInt({ min: 1 }).withMessage('cardapio_id deve ser um número inteiro positivo'),
    body('sobrescrever')
      .optional()
      .isBoolean().withMessage('sobrescrever deve ser um booleano'),
    handleValidationErrors
  ],

  // Validações para pré-visualização
  previsualizar: [
    body('filial_id')
      .notEmpty().withMessage('filial_id é obrigatório')
      .isInt({ min: 1 }).withMessage('filial_id deve ser um número inteiro positivo'),
    body('centro_custo_id')
      .notEmpty().withMessage('centro_custo_id é obrigatório')
      .isInt({ min: 1 }).withMessage('centro_custo_id deve ser um número inteiro positivo'),
    body('contrato_id')
      .notEmpty().withMessage('contrato_id é obrigatório')
      .isInt({ min: 1 }).withMessage('contrato_id deve ser um número inteiro positivo'),
    body('cardapio_id')
      .notEmpty().withMessage('cardapio_id é obrigatório')
      .isInt({ min: 1 }).withMessage('cardapio_id deve ser um número inteiro positivo'),
    handleValidationErrors
  ],

  // Validações para recalcular
  recalcular: [
    param('id')
      .isInt({ min: 1 }).withMessage('ID deve ser um número inteiro positivo'),
    body('sobrescrever')
      .optional()
      .isBoolean().withMessage('sobrescrever deve ser um booleano'),
    handleValidationErrors
  ],

  // Validações para filtros de listagem
  filtros: [
    query('filial_id')
      .optional({ checkFalsy: true })
      .custom((value) => {
        if (!value || value === '') return true;
        const num = parseInt(value);
        return !isNaN(num) && num > 0;
      }).withMessage('filial_id deve ser um número inteiro positivo'),
    query('centro_custo_id')
      .optional({ checkFalsy: true })
      .custom((value) => {
        if (!value || value === '') return true;
        const num = parseInt(value);
        return !isNaN(num) && num > 0;
      }).withMessage('centro_custo_id deve ser um número inteiro positivo'),
    query('contrato_id')
      .optional({ checkFalsy: true })
      .custom((value) => {
        if (!value || value === '') return true;
        const num = parseInt(value);
        return !isNaN(num) && num > 0;
      }).withMessage('contrato_id deve ser um número inteiro positivo'),
    query('cardapio_id')
      .optional({ checkFalsy: true })
      .custom((value) => {
        if (!value || value === '') return true;
        const num = parseInt(value);
        return !isNaN(num) && num > 0;
      }).withMessage('cardapio_id deve ser um número inteiro positivo'),
    query('mes_ref')
      .optional({ checkFalsy: true })
      .custom((value) => {
        if (!value || value === '') return true;
        const num = parseInt(value);
        return !isNaN(num) && num >= 1 && num <= 12;
      }).withMessage('mes_ref deve ser um número entre 1 e 12'),
    query('ano')
      .optional({ checkFalsy: true })
      .custom((value) => {
        if (!value || value === '') return true;
        const num = parseInt(value);
        return !isNaN(num) && num >= 2000 && num <= 2100;
      }).withMessage('ano deve ser um número válido'),
    query('status')
      .optional({ checkFalsy: true })
      .isIn(['pendente', 'gerada', 'cancelada']).withMessage('status inválido'),
    handleValidationErrors
  ]
};

module.exports = { necessidadesValidations, commonValidations };

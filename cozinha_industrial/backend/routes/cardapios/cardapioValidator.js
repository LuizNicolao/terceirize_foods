const { body, query, param } = require('express-validator');
const { createEntityValidationHandler } = require('../../middleware/validationHandler');

// Criar handler de validação específico para cardápios
const handleValidationErrors = createEntityValidationHandler('cardapios');

/**
 * Validações para Cardápios
 */

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
      .isIn(['nome', 'mes_referencia', 'ano_referencia', 'status', 'criado_em', 'atualizado_em'])
      .withMessage('Campo de ordenação inválido'),
    query('sortDirection')
      .optional()
      .isIn(['ASC', 'DESC'])
      .withMessage('Direção de ordenação deve ser ASC ou DESC')
  ]
};

// Validações específicas de cardápios
const cardapiosValidations = {
  criar: [
    body('nome')
      .notEmpty()
      .withMessage('Nome é obrigatório')
      .isString()
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('Nome deve ter entre 1 e 200 caracteres'),
    body('mes_referencia')
      .notEmpty()
      .withMessage('Mês de referência é obrigatório')
      .isInt({ min: 1, max: 12 })
      .withMessage('Mês de referência deve estar entre 1 e 12'),
    body('ano_referencia')
      .notEmpty()
      .withMessage('Ano de referência é obrigatório')
      .isInt({ min: 2000, max: 2100 })
      .withMessage('Ano de referência deve estar entre 2000 e 2100'),
    body('numero_semanas')
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage('Número de semanas deve estar entre 1 e 5'),
    body('filiais')
      .optional()
      .isArray()
      .withMessage('Filiais deve ser um array'),
    body('filiais.*.id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ID de filial inválido'),
    body('centros_custo')
      .optional()
      .isArray()
      .withMessage('Centros de custo deve ser um array'),
    body('centros_custo.*.id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ID de centro de custo inválido'),
    body('contratos')
      .optional()
      .isArray()
      .withMessage('Contratos deve ser um array'),
    body('contratos.*')
      .optional()
      .custom((value) => {
        // Aceitar tanto número quanto objeto com id
        if (typeof value === 'number') {
          return value >= 1;
        }
        if (typeof value === 'object' && value !== null) {
          return typeof value.id === 'number' && value.id >= 1;
        }
        return false;
      })
      .withMessage('ID de contrato inválido'),
    body('produtos_comerciais')
      .optional()
      .isArray()
      .withMessage('Produtos comerciais deve ser um array'),
    body('produtos_comerciais.*.id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ID de produto comercial inválido'),
    body('periodos_atendimento')
      .optional()
      .isArray()
      .withMessage('Períodos de atendimento deve ser um array'),
    body('periodos_atendimento.*')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ID de período de atendimento inválido'),
    body('pratos')
      .optional()
      .isArray()
      .withMessage('Pratos deve ser um array'),
    body('pratos.*.data')
      .optional()
      .isISO8601()
      .withMessage('Data do prato deve ser uma data válida (ISO 8601)'),
    body('pratos.*.periodo_atendimento_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ID de período de atendimento inválido'),
    body('pratos.*.prato_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ID de prato inválido'),
    body('pratos.*.produto_comercial_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ID de produto comercial inválido'),
    body('pratos.*.ordem')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Ordem deve ser um número inteiro positivo'),
    handleValidationErrors
  ],
  atualizar: [
    body('nome')
      .optional()
      .isString()
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('Nome deve ter entre 1 e 200 caracteres'),
    body('mes_referencia')
      .optional()
      .isInt({ min: 1, max: 12 })
      .withMessage('Mês de referência deve estar entre 1 e 12'),
    body('ano_referencia')
      .optional()
      .isInt({ min: 2000, max: 2100 })
      .withMessage('Ano de referência deve estar entre 2000 e 2100'),
    body('numero_semanas')
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage('Número de semanas deve estar entre 1 e 5'),
    body('status')
      .optional()
      .isIn(['ativo', 'inativo'])
      .withMessage('Status deve ser "ativo" ou "inativo"'),
    body('filiais')
      .optional()
      .isArray()
      .withMessage('Filiais deve ser um array'),
    body('filiais.*.id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ID de filial inválido'),
    body('centros_custo')
      .optional()
      .isArray()
      .withMessage('Centros de custo deve ser um array'),
    body('centros_custo.*.id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ID de centro de custo inválido'),
    body('contratos')
      .optional()
      .isArray()
      .withMessage('Contratos deve ser um array'),
    body('contratos.*')
      .optional()
      .custom((value) => {
        // Aceitar tanto número quanto objeto com id
        if (typeof value === 'number') {
          return value >= 1;
        }
        if (typeof value === 'object' && value !== null) {
          return typeof value.id === 'number' && value.id >= 1;
        }
        return false;
      })
      .withMessage('ID de contrato inválido'),
    body('produtos_comerciais')
      .optional()
      .isArray()
      .withMessage('Produtos comerciais deve ser um array'),
    body('produtos_comerciais.*.id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ID de produto comercial inválido'),
    body('periodos_atendimento')
      .optional()
      .isArray()
      .withMessage('Períodos de atendimento deve ser um array'),
    body('periodos_atendimento.*')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ID de período de atendimento inválido'),
    body('pratos')
      .optional()
      .isArray()
      .withMessage('Pratos deve ser um array'),
    body('pratos.*.data')
      .optional()
      .isISO8601()
      .withMessage('Data do prato deve ser uma data válida (ISO 8601)'),
    body('pratos.*.periodo_atendimento_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ID de período de atendimento inválido'),
    body('pratos.*.prato_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ID de prato inválido'),
    body('pratos.*.produto_comercial_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ID de produto comercial inválido'),
    body('pratos.*.ordem')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Ordem deve ser um número inteiro positivo'),
    handleValidationErrors
  ],
  filtros: [
    query('mes_referencia')
      .optional()
      .isInt({ min: 1, max: 12 })
      .withMessage('Mês de referência deve estar entre 1 e 12'),
    query('ano_referencia')
      .optional()
      .isInt({ min: 2000, max: 2100 })
      .withMessage('Ano de referência deve estar entre 2000 e 2100'),
    query('status')
      .optional()
      .isIn(['ativo', 'inativo'])
      .withMessage('Status deve ser "ativo" ou "inativo"'),
    query('filial_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ID de filial inválido'),
    query('centro_custo_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ID de centro de custo inválido'),
    query('contrato_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ID de contrato inválido'),
    query('produto_comercial_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ID de produto comercial inválido'),
    query('periodo_atendimento_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ID de período de atendimento inválido')
  ]
};

module.exports = {
  cardapiosValidations,
  commonValidations
};


/**
 * Validações específicas para Patrimônios
 * Implementa validações usando express-validator
 */

const { body, param, query } = require('express-validator');
const { createEntityValidationHandler } = require('../../middleware/validationHandler');

// Criar handler de validação específico para patrimônios
const handleValidationErrors = createEntityValidationHandler('patrimonios');

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

// Validações específicas para patrimônios
const patrimoniosValidations = {
  // Validação para filtros
  filtros: [
    query('status').optional().isIn(['ativo', 'manutencao', 'obsoleto', 'inativo'])
      .withMessage('Status deve ser: ativo, manutencao, obsoleto ou inativo'),
    query('escola_id').optional().isInt({ min: 1 })
      .withMessage('ID da escola deve ser um número inteiro válido'),
    query('produto_id').optional().isInt({ min: 1 })
      .withMessage('ID do produto deve ser um número inteiro válido'),
    query('data_inicio').optional().isISO8601().toDate()
      .withMessage('Data de início deve ser uma data válida'),
    query('data_fim').optional().isISO8601().toDate()
      .withMessage('Data de fim deve ser uma data válida')
  ],

  // Validação para criar patrimônio
  criarPatrimonio: [
    body('produto_id').isInt({ min: 1 }).withMessage('ID do produto é obrigatório e deve ser válido'),
    body('numero_patrimonio').isString().trim().isLength({ min: 1, max: 20 })
      .withMessage('Número do patrimônio é obrigatório e deve ter entre 1 e 20 caracteres'),
    body('local_atual_id').isInt({ min: 1 }).withMessage('ID da filial atual é obrigatório'),
    body('status').optional().isIn(['ativo', 'manutencao', 'obsoleto', 'inativo'])
      .withMessage('Status deve ser: ativo, manutencao, obsoleto ou inativo'),
    body('data_aquisicao').isISO8601().toDate().withMessage('Data de aquisição é obrigatória e deve ser válida'),
    body('observacoes').optional().isString().trim().isLength({ max: 1000 })
      .withMessage('Observações devem ter no máximo 1000 caracteres'),
    handleValidationErrors
  ],

  // Validação para atualizar patrimônio
  atualizarPatrimonio: [
    param('id').isInt({ min: 1 }).withMessage('ID deve ser um número inteiro válido'),
    body('produto_id').optional().isInt({ min: 1 }).withMessage('ID do produto deve ser válido'),
    body('numero_patrimonio').optional().isString().trim().isLength({ min: 1, max: 20 })
      .withMessage('Número do patrimônio deve ter entre 1 e 20 caracteres'),
    body('local_atual_id').optional().isInt({ min: 1 }).withMessage('ID da filial atual deve ser válido'),
    body('status').optional().isIn(['ativo', 'manutencao', 'obsoleto', 'inativo'])
      .withMessage('Status deve ser: ativo, manutencao, obsoleto ou inativo'),
    body('data_aquisicao').optional().isISO8601().toDate().withMessage('Data de aquisição deve ser válida'),
    body('observacoes').optional().isString().trim().isLength({ max: 1000 })
      .withMessage('Observações devem ter no máximo 1000 caracteres'),
    handleValidationErrors
  ],

  // Validação para movimentar patrimônio
  movimentarPatrimonio: [
    param('id').isInt({ min: 1 }).withMessage('ID deve ser um número inteiro válido'),
    body('local_destino_id').isInt({ min: 1 }).withMessage('ID do local de destino é obrigatório'),
    body('tipo_local_destino').isIn(['filial', 'unidade_escolar']).withMessage('Tipo de local de destino deve ser: filial ou unidade_escolar'),
    body('responsavel_id').isInt({ min: 1 }).withMessage('ID do responsável é obrigatório'),
    body('motivo').optional().isIn(['transferencia', 'manutencao', 'devolucao', 'outro'])
      .withMessage('Motivo deve ser: transferencia, manutencao, devolucao ou outro'),
    body('observacoes').optional().isString().trim().isLength({ max: 1000 })
      .withMessage('Observações devem ter no máximo 1000 caracteres'),
    handleValidationErrors
  ]
};

module.exports = {
  commonValidations,
  patrimoniosValidations,
  handleValidationErrors
};

/**
 * Validações específicas para Unidades Escolares
 * Centraliza todas as validações relacionadas às unidades escolares
 */

const { body, param, query } = require('express-validator');
const { createEntityValidationHandler } = require('../../middleware/validationHandler');

// Criar handler de validação específico para unidades escolares
const handleValidationErrors = createEntityValidationHandler('unidades_escolares');

// Validações comuns
const commonValidations = {
  // Validação de ID
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

// Validações específicas para unidades escolares
const unidadeEscolarValidations = {
  // Validações para criação de unidade escolar
  create: [
    body('codigo_teknisa')
      .notEmpty().withMessage('Código Teknisa é obrigatório')
      .isString().trim().isLength({ min: 1, max: 50 }).withMessage('Código deve ter entre 1 e 50 caracteres'),
    
    body('nome_escola')
      .notEmpty().withMessage('Nome da escola é obrigatório')
      .isString().trim().isLength({ min: 2, max: 200 }).withMessage('Nome deve ter entre 2 e 200 caracteres'),
    
    body('cidade')
      .notEmpty().withMessage('Cidade é obrigatória')
      .isString().trim().isLength({ min: 2, max: 100 }).withMessage('Cidade deve ter entre 2 e 100 caracteres'),
    
    body('estado')
      .notEmpty().withMessage('Estado é obrigatório')
      .isString().trim().isLength({ min: 2, max: 50 }).withMessage('Estado deve ter entre 2 e 50 caracteres'),
    
    body('pais')
      .optional()
      .isString().trim().isLength({ max: 50 }).withMessage('País deve ter no máximo 50 caracteres'),
    
    body('endereco')
      .notEmpty().withMessage('Endereço é obrigatório')
      .isString().trim().isLength({ max: 300 }).withMessage('Endereço deve ter no máximo 300 caracteres'),
    
    body('numero')
      .optional()
      .isString().trim().isLength({ max: 20 }).withMessage('Número deve ter no máximo 20 caracteres'),
    
    body('bairro')
      .optional()
      .isString().trim().isLength({ max: 100 }).withMessage('Bairro deve ter no máximo 100 caracteres'),
    
    body('cep')
      .optional()
      .isString().trim().matches(/^\d{5}-?\d{3}$/).withMessage('CEP deve estar no formato 00000-000'),
    
    body('centro_distribuicao')
      .optional()
      .isString().trim().isLength({ max: 100 }).withMessage('Centro de distribuição deve ter no máximo 100 caracteres'),
    
    body('rota_id')
      .optional()
      .isInt({ min: 1 }).withMessage('ID da rota deve ser um número inteiro positivo'),
    
    body('regional')
      .optional()
      .isString().trim().isLength({ max: 100 }).withMessage('Regional deve ter no máximo 100 caracteres'),
    
    body('lot')
      .optional()
      .isString().trim().isLength({ max: 50 }).withMessage('Lote deve ter no máximo 50 caracteres'),
    
    body('cc_senior')
      .optional()
      .isString().trim().isLength({ max: 50 }).withMessage('C.C. Senior deve ter no máximo 50 caracteres'),
    
    body('codigo_senior')
      .optional()
      .isString().trim().isLength({ max: 50 }).withMessage('Código Senior deve ter no máximo 50 caracteres'),
    
    body('abastecimento')
      .optional()
      .isString().trim().isLength({ max: 100 }).withMessage('Abastecimento deve ter no máximo 100 caracteres'),
    
    body('ordem_entrega')
      .optional()
      .isInt({ min: 0 }).withMessage('Ordem de entrega deve ser um número inteiro positivo'),
    
    body('status')
      .optional()
      .isIn(['ativo', 'inativo']).withMessage('Status deve ser ativo ou inativo'),
    
    body('observacoes')
      .optional()
      .isString().trim().isLength({ max: 500 }).withMessage('Observações devem ter no máximo 500 caracteres'),
    
    handleValidationErrors
  ],

  // Validações para atualização de unidade escolar
  update: [
    param('id').isInt({ min: 1 }).withMessage('ID deve ser um número inteiro positivo'),
    
    body('codigo_teknisa')
      .optional()
      .isString().trim().isLength({ min: 1, max: 50 }).withMessage('Código deve ter entre 1 e 50 caracteres'),
    
    body('nome_escola')
      .optional()
      .isString().trim().isLength({ min: 2, max: 200 }).withMessage('Nome deve ter entre 2 e 200 caracteres'),
    
    body('cidade')
      .optional()
      .isString().trim().isLength({ min: 2, max: 100 }).withMessage('Cidade deve ter entre 2 e 100 caracteres'),
    
    body('estado')
      .optional()
      .isString().trim().isLength({ min: 2, max: 50 }).withMessage('Estado deve ter entre 2 e 50 caracteres'),
    
    body('pais')
      .optional()
      .isString().trim().isLength({ max: 50 }).withMessage('País deve ter no máximo 50 caracteres'),
    
    body('endereco')
      .optional()
      .isString().trim().isLength({ max: 300 }).withMessage('Endereço deve ter no máximo 300 caracteres'),
    
    body('numero')
      .optional()
      .isString().trim().isLength({ max: 20 }).withMessage('Número deve ter no máximo 20 caracteres'),
    
    body('bairro')
      .optional()
      .isString().trim().isLength({ max: 100 }).withMessage('Bairro deve ter no máximo 100 caracteres'),
    
    body('cep')
      .optional()
      .isString().trim().matches(/^\d{5}-?\d{3}$/).withMessage('CEP deve estar no formato 00000-000'),
    
    body('centro_distribuicao')
      .optional()
      .isString().trim().isLength({ max: 100 }).withMessage('Centro de distribuição deve ter no máximo 100 caracteres'),
    
    body('rota_id')
      .optional()
      .isInt({ min: 1 }).withMessage('ID da rota deve ser um número inteiro positivo'),
    
    body('regional')
      .optional()
      .isString().trim().isLength({ max: 100 }).withMessage('Regional deve ter no máximo 100 caracteres'),
    
    body('lot')
      .optional()
      .isString().trim().isLength({ max: 50 }).withMessage('Lote deve ter no máximo 50 caracteres'),
    
    body('cc_senior')
      .optional()
      .isString().trim().isLength({ max: 50 }).withMessage('C.C. Senior deve ter no máximo 50 caracteres'),
    
    body('codigo_senior')
      .optional()
      .isString().trim().isLength({ max: 50 }).withMessage('Código Senior deve ter no máximo 50 caracteres'),
    
    body('abastecimento')
      .optional()
      .isString().trim().isLength({ max: 100 }).withMessage('Abastecimento deve ter no máximo 100 caracteres'),
    
    body('ordem_entrega')
      .optional()
      .isInt({ min: 0 }).withMessage('Ordem de entrega deve ser um número inteiro positivo'),
    
    body('status')
      .optional()
      .isIn(['ativo', 'inativo']).withMessage('Status deve ser ativo ou inativo'),
    
    body('observacoes')
      .optional()
      .isString().trim().isLength({ max: 500 }).withMessage('Observações devem ter no máximo 500 caracteres'),
    
    handleValidationErrors
  ]
};

module.exports = {
  unidadeEscolarValidations,
  commonValidations
};

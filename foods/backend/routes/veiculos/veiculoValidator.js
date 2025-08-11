/**
 * Validações específicas para Veículos
 * Centraliza todas as validações relacionadas aos veículos
 */

const { body, param, query, validationResult } = require('express-validator');
const { validationResponse } = require('../../middleware/responseHandler');

// Middleware para capturar erros de validação
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return validationResponse(res, errors.array());
  }
  next();
};

// Validações comuns
const commonValidations = {
  // Validação de ID
  id: [
    param('id').isInt({ min: 1 }).withMessage('ID deve ser um número inteiro positivo')
  ],
  
  // Validação de paginação
  pagination: [
    query('page').optional().isInt({ min: 1 }).withMessage('Página deve ser um número inteiro positivo'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limite deve ser entre 1 e 100')
  ],
  
  // Validação de busca
  search: [
    query('search').optional().isString().trim().isLength({ min: 1, max: 100 }).withMessage('Termo de busca deve ter entre 1 e 100 caracteres')
  ]
};

// Validações específicas para veículos
const veiculoValidations = {
  // Validações para criação de veículo
  create: [
    body('placa')
      .notEmpty().withMessage('Placa é obrigatória')
      .isString().trim().matches(/^[A-Z]{3}-\d{4}$/).withMessage('Placa deve estar no formato ABC-1234'),
    
    body('marca')
      .notEmpty().withMessage('Marca é obrigatória')
      .isString().trim().isLength({ min: 2, max: 50 }).withMessage('Marca deve ter entre 2 e 50 caracteres'),
    
    body('modelo')
      .notEmpty().withMessage('Modelo é obrigatório')
      .isString().trim().isLength({ min: 2, max: 50 }).withMessage('Modelo deve ter entre 2 e 50 caracteres'),
    
    body('chassi')
      .optional()
      .isString().trim().isLength({ min: 17, max: 17 }).withMessage('Chassi deve ter 17 caracteres'),
    
    body('ano_fabricacao')
      .optional()
      .isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage('Ano de fabricação deve ser válido'),
    
    body('ano_modelo')
      .optional()
      .isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage('Ano do modelo deve ser válido'),
    
    body('tipo_veiculo')
      .optional()
      .isIn(['caminhao', 'van', 'carro', 'moto', 'utilitario']).withMessage('Tipo deve ser caminhao, van, carro, moto ou utilitario'),
    
    body('categoria')
      .optional()
      .isIn(['leve', 'medio', 'pesado']).withMessage('Categoria deve ser leve, medio ou pesado'),
    
    body('status')
      .optional()
      .isIn(['ativo', 'inativo', 'manutencao', 'aposentado']).withMessage('Status deve ser ativo, inativo, manutencao ou aposentado'),
    
    body('capacidade_kg')
      .optional()
      .isFloat({ min: 0 }).withMessage('Capacidade em kg deve ser um número positivo'),
    
    body('capacidade_m3')
      .optional()
      .isFloat({ min: 0 }).withMessage('Capacidade em m³ deve ser um número positivo'),
    
    body('consumo_medio')
      .optional()
      .isFloat({ min: 0 }).withMessage('Consumo médio deve ser um número positivo'),
    
    body('cor')
      .optional()
      .isString().trim().isLength({ max: 30 }).withMessage('Cor deve ter no máximo 30 caracteres'),
    
    body('renavam')
      .optional()
      .isString().trim().isLength({ min: 9, max: 11 }).withMessage('Renavam deve ter entre 9 e 11 caracteres'),
    
    body('valor_aquisicao')
      .optional()
      .isFloat({ min: 0 }).withMessage('Valor de aquisição deve ser um número positivo'),
    
    body('observacoes')
      .optional()
      .isString().trim().isLength({ max: 500 }).withMessage('Observações devem ter no máximo 500 caracteres')
  ],

  // Validações para atualização de veículo
  update: [
    param('id').isInt({ min: 1 }).withMessage('ID deve ser um número inteiro positivo'),
    
    body('placa')
      .optional()
      .isString().trim().matches(/^[A-Z]{3}-\d{4}$/).withMessage('Placa deve estar no formato ABC-1234'),
    
    body('marca')
      .optional()
      .isString().trim().isLength({ min: 2, max: 50 }).withMessage('Marca deve ter entre 2 e 50 caracteres'),
    
    body('modelo')
      .optional()
      .isString().trim().isLength({ min: 2, max: 50 }).withMessage('Modelo deve ter entre 2 e 50 caracteres'),
    
    body('chassi')
      .optional()
      .isString().trim().isLength({ min: 17, max: 17 }).withMessage('Chassi deve ter 17 caracteres'),
    
    body('ano_fabricacao')
      .optional()
      .isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage('Ano de fabricação deve ser válido'),
    
    body('ano_modelo')
      .optional()
      .isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage('Ano do modelo deve ser válido'),
    
    body('tipo_veiculo')
      .optional()
      .isIn(['caminhao', 'van', 'carro', 'moto', 'utilitario']).withMessage('Tipo deve ser caminhao, van, carro, moto ou utilitario'),
    
    body('categoria')
      .optional()
      .isIn(['leve', 'medio', 'pesado']).withMessage('Categoria deve ser leve, medio ou pesado'),
    
    body('status')
      .optional()
      .isIn(['ativo', 'inativo', 'manutencao', 'aposentado']).withMessage('Status deve ser ativo, inativo, manutencao ou aposentado'),
    
    body('capacidade_kg')
      .optional()
      .isFloat({ min: 0 }).withMessage('Capacidade em kg deve ser um número positivo'),
    
    body('capacidade_m3')
      .optional()
      .isFloat({ min: 0 }).withMessage('Capacidade em m³ deve ser um número positivo'),
    
    body('consumo_medio')
      .optional()
      .isFloat({ min: 0 }).withMessage('Consumo médio deve ser um número positivo'),
    
    body('cor')
      .optional()
      .isString().trim().isLength({ max: 30 }).withMessage('Cor deve ter no máximo 30 caracteres'),
    
    body('renavam')
      .optional()
      .isString().trim().isLength({ min: 9, max: 11 }).withMessage('Renavam deve ter entre 9 e 11 caracteres'),
    
    body('valor_aquisicao')
      .optional()
      .isFloat({ min: 0 }).withMessage('Valor de aquisição deve ser um número positivo'),
    
    body('observacoes')
      .optional()
      .isString().trim().isLength({ max: 500 }).withMessage('Observações devem ter no máximo 500 caracteres')
  ]
};

module.exports = {
  veiculoValidations,
  commonValidations,
  handleValidationErrors
};

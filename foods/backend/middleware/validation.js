/**
 * Middleware de validação padronizado
 * Implementa validações consistentes usando express-validator
 */

const { body, param, query, validationResult } = require('express-validator');
const { validationResponse } = require('./responseHandler');

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
  ],

  // Validação de email
  email: body('email')
    .custom((value) => {
      if (value && value.trim() !== '') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          throw new Error('Email deve ser um email válido');
        }
      }
      return true;
    })
    .withMessage('Email deve ser um email válido'),

  // Validação de senha
  password: body('senha')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres'),

  // Validação de nome
  name: body('nome')
    .isLength({ min: 3, max: 100 })
    .withMessage('Nome deve ter entre 3 e 100 caracteres')
    .trim(),

  // Validação de telefone
  phone: body('telefone')
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

  // Validação de CNPJ
  cnpj: body('cnpj')
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

  // Validação de CEP
  cep: body('cep')
    .optional()
    .custom((value) => {
      if (value && value.trim() !== '') {
        const cepLimpo = value.replace(/\D/g, '');
        if (cepLimpo.length !== 8) {
          throw new Error('CEP deve ter 8 dígitos');
        }
      }
      return true;
    })
    .withMessage('CEP deve ter 8 dígitos'),

  // Validação de status
  status: body('status')
    .optional()
    .isIn(['ativo', 'inativo', 'bloqueado'])
    .withMessage('Status deve ser ativo, inativo ou bloqueado')
};

// Validações específicas para usuários foram movidas para routes/usuarios/usuarioValidator.js

// Validações para Fornecedores - MOVIDAS PARA ARQUIVO ESPECÍFICO

// Validações específicas para clientes - MOVIDAS PARA ARQUIVO ESPECÍFICO

// Validações específicas para grupos - MOVIDAS PARA routes/grupos/grupoValidator.js


// Validações específicas para subgrupos - MOVIDAS PARA routes/subgrupos/subgrupoValidator.js

// Validações específicas para marcas
const marcaValidations = {
  create: [
    body('marca')
      .isLength({ min: 2, max: 100 })
      .withMessage('Marca deve ter entre 2 e 100 caracteres')
      .matches(/^[a-zA-ZÀ-ÿ0-9\s\-\.]+$/)
      .withMessage('Marca deve conter apenas letras, números, espaços, hífens e pontos'),
    body('fabricante')
      .isLength({ min: 2, max: 100 })
      .withMessage('Fabricante deve ter entre 2 e 100 caracteres')
      .matches(/^[a-zA-ZÀ-ÿ0-9\s\-\.]+$/)
      .withMessage('Fabricante deve conter apenas letras, números, espaços, hífens e pontos'),
    body('status')
      .optional()
      .isIn([0, 1])
      .withMessage('Status deve ser 0 (inativo) ou 1 (ativo)'),
    handleValidationErrors
  ],

  update: [
    commonValidations.id,
    body('marca')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Marca deve ter entre 2 e 100 caracteres')
      .matches(/^[a-zA-ZÀ-ÿ0-9\s\-\.]+$/)
      .withMessage('Marca deve conter apenas letras, números, espaços, hífens e pontos'),
    body('fabricante')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Fabricante deve ter entre 2 e 100 caracteres')
      .matches(/^[a-zA-ZÀ-ÿ0-9\s\-\.]+$/)
      .withMessage('Fabricante deve conter apenas letras, números, espaços, hífens e pontos'),
    body('status')
      .optional()
      .isIn([0, 1])
      .withMessage('Status deve ser 0 (inativo) ou 1 (ativo)'),
    handleValidationErrors
  ]
};

// Validações específicas para classes - MOVIDAS PARA routes/classes/classeValidator.js

// Validações específicas para produtos foram movidas para routes/produtos/produtoValidator.js

// Validações para Filiais - MOVIDAS PARA ARQUIVO ESPECÍFICO

// Validações para Unidades
const unidadeValidations = [
  body('nome')
    .notEmpty()
    .withMessage('Nome da unidade é obrigatório')
    .isLength({ min: 3, max: 100 })
    .withMessage('Nome da unidade deve ter entre 3 e 100 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ0-9\s\-\.\(\)]+$/)
    .withMessage('Nome da unidade contém caracteres inválidos')
    .trim(),
  
  body('sigla')
    .notEmpty()
    .withMessage('Sigla é obrigatória')
    .isLength({ min: 1, max: 10 })
    .withMessage('Sigla deve ter entre 1 e 10 caracteres')
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Sigla deve conter apenas letras maiúsculas e números')
    .trim(),
  
  body('status')
    .optional()
    .isIn(['0', '1'])
    .withMessage('Status deve ser 0 (Inativo) ou 1 (Ativo)')
];

const unidadeAtualizacaoValidations = [
  body('nome')
    .optional()
    .isLength({ min: 3, max: 100 })
    .withMessage('Nome da unidade deve ter entre 3 e 100 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ0-9\s\-\.\(\)]+$/)
    .withMessage('Nome da unidade contém caracteres inválidos')
    .trim(),
  
  body('sigla')
    .optional()
    .isLength({ min: 1, max: 10 })
    .withMessage('Sigla deve ter entre 1 e 10 caracteres')
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Sigla deve conter apenas letras maiúsculas e números')
    .trim(),
  
  body('status')
    .optional()
    .isIn(['0', '1'])
    .withMessage('Status deve ser 0 (Inativo) ou 1 (Ativo)')
 ];

// Validações para Unidades Escolares - MOVIDAS PARA ARQUIVO ESPECÍFICO

// Validações para Motoristas - MOVIDAS PARA ARQUIVO ESPECÍFICO

// Validações para Ajudantes - MOVIDAS PARA ARQUIVO ESPECÍFICO

// Validações para Veículos - MOVIDAS PARA ARQUIVO ESPECÍFICO

// Validações para Rotas - MOVIDAS PARA ARQUIVO ESPECÍFICO

// Validações para Nome Genérico de Produto
const nomeGenericoProdutoValidations = [
  body('nome')
    .notEmpty()
    .withMessage('Nome é obrigatório')
    .isLength({ min: 3, max: 200 })
    .withMessage('Nome deve ter entre 3 e 200 caracteres')
    .trim(),
  
  body('grupo_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID do grupo deve ser um número inteiro válido'),
  
  body('subgrupo_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID do subgrupo deve ser um número inteiro válido'),
  
  body('classe_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID da classe deve ser um número inteiro válido'),
  
  body('status')
    .optional()
    .isIn([0, 1, true, false])
    .withMessage('Status deve ser 0 (inativo) ou 1 (ativo)')
];

const nomeGenericoProdutoAtualizacaoValidations = [
  body('nome')
    .optional()
    .isLength({ min: 3, max: 200 })
    .withMessage('Nome deve ter entre 3 e 200 caracteres')
    .trim(),
  
  body('grupo_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID do grupo deve ser um número inteiro válido'),
  
  body('subgrupo_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID do subgrupo deve ser um número inteiro válido'),
  
  body('classe_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID da classe deve ser um número inteiro válido'),
  
  body('status')
    .optional()
    .isIn([0, 1, true, false])
    .withMessage('Status deve ser 0 (inativo) ou 1 (ativo)')
];

module.exports = {
  handleValidationErrors,
  commonValidations,

  marcaValidations,

  unidadeValidations,
  unidadeAtualizacaoValidations,
  nomeGenericoProdutoValidations,
  nomeGenericoProdutoAtualizacaoValidations
}; 
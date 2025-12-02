/**
 * Validações específicas para Ficha Homologação
 * Implementa validações usando express-validator
 */

const { body, param, query } = require('express-validator');
const { createEntityValidationHandler } = require('../../middleware/validationHandler');

// Criar handler de validação específico para ficha homologação
const handleValidationErrors = createEntityValidationHandler('ficha-homologacao');

// Middleware para limpar campos vazios
const cleanEmptyFields = (req, res, next) => {
  // Converter campos vazios para null
  const fieldsToClean = [
    'produto_generico_id', 'marca_id', 'fornecedor_id', 'unidade_medida_id',
    'avaliador_id', 'composicao', 'fabricante', 'lote', 'foto_embalagem',
    'foto_produto', 'conclusao'
  ];
  
  fieldsToClean.forEach(field => {
    if (req.body[field] === '' || req.body[field] === undefined || req.body[field] === 'null') {
      req.body[field] = null;
    }
  });

  // Converter campos numéricos
  if (req.body.produto_generico_id && req.body.produto_generico_id !== '') {
    req.body.produto_generico_id = parseInt(req.body.produto_generico_id);
  }

  if (req.body.marca_id && req.body.marca_id !== '') {
    req.body.marca_id = parseInt(req.body.marca_id);
  }

  if (req.body.fornecedor_id && req.body.fornecedor_id !== '') {
    req.body.fornecedor_id = parseInt(req.body.fornecedor_id);
  }

  if (req.body.unidade_medida_id && req.body.unidade_medida_id !== '') {
    req.body.unidade_medida_id = parseInt(req.body.unidade_medida_id);
  }

  if (req.body.avaliador_id && req.body.avaliador_id !== '') {
    req.body.avaliador_id = parseInt(req.body.avaliador_id);
  }

  next();
};

// Validações comuns
const commonValidations = {
  // Validação de ID numérico
  id: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID deve ser um número inteiro positivo')
  ],

  // Validação de busca
  search: [
    query('search')
      .optional()
      .isString()
      .withMessage('Termo de busca deve ser uma string')
      .trim()
  ],

  // Validação de paginação
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Página deve ser um número inteiro positivo'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 1000 })
      .withMessage('Limite deve ser um número entre 1 e 1000')
  ]
};

// Validações específicas para criação
const fichaHomologacaoValidations = {
  create: [
    cleanEmptyFields,
    body('tipo')
      .notEmpty()
      .withMessage('Tipo é obrigatório')
      .isIn(['NOVO_PRODUTO', 'REAVALIACAO'])
      .withMessage('Tipo deve ser NOVO_PRODUTO ou REAVALIACAO'),
    body('data_analise')
      .notEmpty()
      .withMessage('Data de análise é obrigatória')
      .isISO8601()
      .withMessage('Data de análise deve ser uma data válida'),
    body('produto_generico_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Nome genérico ID deve ser um número inteiro positivo'),
    body('marca_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Marca ID deve ser um número inteiro positivo'),
    body('fornecedor_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Fornecedor ID deve ser um número inteiro positivo'),
    body('unidade_medida_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Unidade de medida ID deve ser um número inteiro positivo'),
    body('avaliador_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Avaliador ID deve ser um número inteiro positivo'),
    body('fabricante')
      .optional()
      .isString()
      .isLength({ max: 100 })
      .withMessage('Fabricante deve ter no máximo 100 caracteres'),
    body('composicao')
      .optional()
      .isString()
      .withMessage('Composição deve ser uma string'),
    body('lote')
      .optional()
      .isString()
      .isLength({ max: 50 })
      .withMessage('Lote deve ter no máximo 50 caracteres'),
    body('peso')
      .optional()
      .isIn(['BOM', 'REGULAR', 'RUIM'])
      .withMessage('Peso deve ser BOM, REGULAR ou RUIM'),
    body('peso_cru')
      .optional()
      .isIn(['BOM', 'REGULAR', 'RUIM'])
      .withMessage('Peso cru deve ser BOM, REGULAR ou RUIM'),
    body('peso_cozido')
      .optional()
      .isIn(['BOM', 'REGULAR', 'RUIM'])
      .withMessage('Peso cozido deve ser BOM, REGULAR ou RUIM'),
    body('fator_coccao')
      .optional()
      .isIn(['BOM', 'REGULAR', 'RUIM'])
      .withMessage('Fator de cocção deve ser BOM, REGULAR ou RUIM'),
    body('cor')
      .optional()
      .isIn(['BOM', 'REGULAR', 'RUIM'])
      .withMessage('Cor deve ser BOM, REGULAR ou RUIM'),
    body('odor')
      .optional()
      .isIn(['BOM', 'REGULAR', 'RUIM'])
      .withMessage('Odor deve ser BOM, REGULAR ou RUIM'),
    body('sabor')
      .optional()
      .isIn(['BOM', 'REGULAR', 'RUIM'])
      .withMessage('Sabor deve ser BOM, REGULAR ou RUIM'),
    body('aparencia')
      .optional()
      .isIn(['BOM', 'REGULAR', 'RUIM'])
      .withMessage('Aparência deve ser BOM, REGULAR ou RUIM'),
    body('status')
      .optional()
      .isIn(['ativo', 'inativo'])
      .withMessage('Status deve ser ativo ou inativo'),
    handleValidationErrors
  ],

  update: [
    cleanEmptyFields,
    body('tipo')
      .optional()
      .isIn(['NOVO_PRODUTO', 'REAVALIACAO'])
      .withMessage('Tipo deve ser NOVO_PRODUTO ou REAVALIACAO'),
    body('data_analise')
      .optional()
      .isISO8601()
      .withMessage('Data de análise deve ser uma data válida'),
    body('produto_generico_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Nome genérico ID deve ser um número inteiro positivo'),
    body('marca_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Marca ID deve ser um número inteiro positivo'),
    body('fornecedor_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Fornecedor ID deve ser um número inteiro positivo'),
    body('unidade_medida_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Unidade de medida ID deve ser um número inteiro positivo'),
    body('avaliador_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Avaliador ID deve ser um número inteiro positivo'),
    body('fabricante')
      .optional()
      .isString()
      .isLength({ max: 100 })
      .withMessage('Fabricante deve ter no máximo 100 caracteres'),
    body('composicao')
      .optional()
      .isString()
      .withMessage('Composição deve ser uma string'),
    body('lote')
      .optional()
      .isString()
      .isLength({ max: 50 })
      .withMessage('Lote deve ter no máximo 50 caracteres'),
    body('peso')
      .optional()
      .isIn(['BOM', 'REGULAR', 'RUIM'])
      .withMessage('Peso deve ser BOM, REGULAR ou RUIM'),
    body('peso_cru')
      .optional()
      .isIn(['BOM', 'REGULAR', 'RUIM'])
      .withMessage('Peso cru deve ser BOM, REGULAR ou RUIM'),
    body('peso_cozido')
      .optional()
      .isIn(['BOM', 'REGULAR', 'RUIM'])
      .withMessage('Peso cozido deve ser BOM, REGULAR ou RUIM'),
    body('fator_coccao')
      .optional()
      .isIn(['BOM', 'REGULAR', 'RUIM'])
      .withMessage('Fator de cocção deve ser BOM, REGULAR ou RUIM'),
    body('cor')
      .optional()
      .isIn(['BOM', 'REGULAR', 'RUIM'])
      .withMessage('Cor deve ser BOM, REGULAR ou RUIM'),
    body('odor')
      .optional()
      .isIn(['BOM', 'REGULAR', 'RUIM'])
      .withMessage('Odor deve ser BOM, REGULAR ou RUIM'),
    body('sabor')
      .optional()
      .isIn(['BOM', 'REGULAR', 'RUIM'])
      .withMessage('Sabor deve ser BOM, REGULAR ou RUIM'),
    body('aparencia')
      .optional()
      .isIn(['BOM', 'REGULAR', 'RUIM'])
      .withMessage('Aparência deve ser BOM, REGULAR ou RUIM'),
    body('status')
      .optional()
      .isIn(['ativo', 'inativo'])
      .withMessage('Status deve ser ativo ou inativo'),
    handleValidationErrors
  ]
};

module.exports = {
  fichaHomologacaoValidations,
  commonValidations
};


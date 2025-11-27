const { body, param, query } = require('express-validator');
const { createEntityValidationHandler } = require('../../middleware/validationHandler');

// Criar handler de validação específico para notas fiscais
const handleValidationErrors = createEntityValidationHandler('notas-fiscais');

// Validações comuns
const commonValidations = {
  id: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID deve ser um número inteiro positivo')
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
  ]
};

// Validações específicas para notas fiscais
const notaFiscalValidations = {
  // Validações para criação de nota fiscal
  create: [
    body('tipo_nota')
      .optional()
      .isIn(['ENTRADA', 'SAIDA'])
      .withMessage('Tipo de nota deve ser ENTRADA ou SAIDA'),
    
    body('numero_nota')
      .notEmpty()
      .withMessage('Número da nota é obrigatório')
      .isLength({ max: 20 })
      .withMessage('Número da nota deve ter no máximo 20 caracteres'),
    
    body('serie')
      .optional()
      .isLength({ max: 10 })
      .withMessage('Série deve ter no máximo 10 caracteres'),
    
    body('chave_acesso')
      .optional()
      .isLength({ min: 44, max: 44 })
      .withMessage('Chave de acesso deve ter exatamente 44 caracteres'),
    
    body('fornecedor_id')
      .notEmpty()
      .withMessage('Fornecedor é obrigatório')
      .isInt({ min: 1 })
      .withMessage('Fornecedor deve ser um ID válido'),
    
    body('filial_id')
      .notEmpty()
      .withMessage('Filial é obrigatória')
      .isInt({ min: 1 })
      .withMessage('Filial deve ser um ID válido'),
    
    body('data_emissao')
      .notEmpty()
      .withMessage('Data de emissão é obrigatória')
      .isISO8601()
      .withMessage('Data de emissão deve estar no formato ISO 8601'),
    
    body('data_entrada')
      .notEmpty()
      .withMessage('Data de entrada é obrigatória')
      .isISO8601()
      .withMessage('Data de entrada deve estar no formato ISO 8601'),
    
    body('valor_produtos')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Valor dos produtos deve ser um número positivo'),
    
    body('valor_frete')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Valor do frete deve ser um número positivo'),
    
    body('valor_seguro')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Valor do seguro deve ser um número positivo'),
    
    body('valor_desconto')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Valor do desconto deve ser um número positivo'),
    
    body('valor_outras_despesas')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Valor de outras despesas deve ser um número positivo'),
    
    body('valor_ipi')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Valor do IPI deve ser um número positivo'),
    
    body('valor_icms')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Valor do ICMS deve ser um número positivo'),
    
    body('valor_icms_st')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Valor do ICMS ST deve ser um número positivo'),
    
    body('valor_pis')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Valor do PIS deve ser um número positivo'),
    
    body('valor_cofins')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Valor do COFINS deve ser um número positivo'),
    
    body('tipo_frete')
      .optional()
      .isIn(['0-EMITENTE', '1-DESTINATARIO', '2-TERCEIROS', '9-SEM_FRETE'])
      .withMessage('Tipo de frete inválido'),
    
    body('itens')
      .isArray({ min: 1 })
      .withMessage('A nota fiscal deve ter pelo menos um item'),
    
    body('itens.*.codigo_produto')
      .notEmpty()
      .withMessage('Código do produto é obrigatório no item')
      .isLength({ max: 60 })
      .withMessage('Código do produto deve ter no máximo 60 caracteres'),
    
    body('itens.*.descricao')
      .notEmpty()
      .withMessage('Descrição do produto é obrigatória no item')
      .isLength({ max: 255 })
      .withMessage('Descrição deve ter no máximo 255 caracteres'),
    
    body('itens.*.quantidade')
      .notEmpty()
      .withMessage('Quantidade é obrigatória no item')
      .isFloat({ min: 0.0001 })
      .withMessage('Quantidade deve ser um número positivo'),
    
    body('itens.*.valor_unitario')
      .notEmpty()
      .withMessage('Valor unitário é obrigatório no item')
      .isFloat({ min: 0 })
      .withMessage('Valor unitário deve ser um número positivo'),
    
    handleValidationErrors
  ],

  // Validações para atualização de nota fiscal
  update: [
    commonValidations.id,
    body('tipo_nota')
      .optional()
      .isIn(['ENTRADA', 'SAIDA'])
      .withMessage('Tipo de nota deve ser ENTRADA ou SAIDA'),
    
    body('numero_nota')
      .optional()
      .isLength({ max: 20 })
      .withMessage('Número da nota deve ter no máximo 20 caracteres'),
    
    body('serie')
      .optional()
      .isLength({ max: 10 })
      .withMessage('Série deve ter no máximo 10 caracteres'),
    
    body('chave_acesso')
      .optional()
      .isLength({ min: 44, max: 44 })
      .withMessage('Chave de acesso deve ter exatamente 44 caracteres'),
    
    body('fornecedor_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Fornecedor deve ser um ID válido'),
    
    body('filial_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Filial deve ser um ID válido'),
    
    body('data_emissao')
      .optional()
      .isISO8601()
      .withMessage('Data de emissão deve estar no formato ISO 8601'),
    
    body('data_entrada')
      .optional()
      .isISO8601()
      .withMessage('Data de entrada deve estar no formato ISO 8601'),
    
    body('itens')
      .optional()
      .isArray({ min: 1 })
      .withMessage('A nota fiscal deve ter pelo menos um item'),
    
    handleValidationErrors
  ]
};

module.exports = {
  notaFiscalValidations,
  commonValidations,
  handleValidationErrors
};


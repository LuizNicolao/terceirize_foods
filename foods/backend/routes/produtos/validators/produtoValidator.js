/**
 * Validador Principal de Produtos
 * Combina todos os módulos de validação
 */

const { param, query, validationResult } = require('express-validator');
const { basicInfoValidations } = require('./basicInfoValidator');
const { classificationValidations } = require('./classificationValidator');
const { dimensionsValidations } = require('./dimensionsValidator');
const { taxationValidations } = require('./taxationValidator');
const { documentsValidations } = require('./documentsValidator');
const { referencesValidations } = require('./referencesValidator');

// Middleware para tratar erros de validação com mensagens detalhadas
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Organizar erros por categoria para melhor apresentação
    const errorCategories = {
      basicInfo: [],
      classification: [],
      dimensions: [],
      taxation: [],
      documents: [],
      references: []
    };

    errors.array().forEach(error => {
      const field = error.path;
      
      // Categorizar erros baseado no campo
      if (['nome', 'codigo_produto', 'codigo_barras', 'fator_conversao', 'status'].includes(field)) {
        errorCategories.basicInfo.push(error);
      } else if (['unidade_id', 'grupo_id', 'subgrupo_id', 'classe_id', 'nome_generico_id', 'produto_origem_id', 'marca_id'].includes(field)) {
        errorCategories.classification.push(error);
      } else if (['peso_liquido', 'peso_bruto', 'comprimento', 'largura', 'altura', 'volume', 'regra_palet_un'].includes(field)) {
        errorCategories.dimensions.push(error);
      } else if (['ncm', 'cest', 'cfop', 'ean', 'cst_icms', 'csosn', 'aliquota_icms', 'aliquota_ipi', 'aliquota_pis', 'aliquota_cofins'].includes(field)) {
        errorCategories.taxation.push(error);
      } else if (['ficha_homologacao', 'registro_especifico', 'tipo_registro', 'prazo_validade', 'unidade_validade'].includes(field)) {
        errorCategories.documents.push(error);
      } else {
        errorCategories.references.push(error);
      }
    });

    // Criar mensagem detalhada
    let detailedMessage = 'Dados inválidos:\n';
    Object.entries(errorCategories).forEach(([category, categoryErrors]) => {
      if (categoryErrors.length > 0) {
        const categoryName = {
          basicInfo: 'Informações Básicas',
          classification: 'Classificação',
          dimensions: 'Dimensões e Pesos',
          taxation: 'Tributação',
          documents: 'Documentos e Registros',
          references: 'Referências'
        }[category];
        
        detailedMessage += `\n${categoryName}:\n`;
        categoryErrors.forEach(error => {
          detailedMessage += `• ${error.msg}\n`;
        });
      }
    });

    return res.status(422).json({
      success: false,
      message: 'Dados inválidos',
      detailedMessage: detailedMessage.trim(),
      errors: errors.array(),
      errorCategories
    });
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
  ]
};

// Validações específicas para produtos
const produtoValidations = {
  create: [
    ...basicInfoValidations,
    ...classificationValidations,
    ...dimensionsValidations,
    ...taxationValidations,
    ...documentsValidations,
    ...referencesValidations,
    handleValidationErrors
  ],

  update: [
    commonValidations.id,
    ...basicInfoValidations.map(validation => validation.optional()),
    ...classificationValidations.map(validation => validation.optional()),
    ...dimensionsValidations.map(validation => validation.optional()),
    ...taxationValidations.map(validation => validation.optional()),
    ...documentsValidations.map(validation => validation.optional()),
    ...referencesValidations.map(validation => validation.optional()),
    handleValidationErrors
  ]
};

module.exports = {
  produtoValidations,
  commonValidations,
  handleValidationErrors
};

/**
 * Middleware universal para tratamento de erros de validação
 * Pode ser usado em qualquer rota de cadastro
 */

const { validationResult } = require('express-validator');

/**
 * Middleware para tratar erros de validação com categorização automática
 * @param {Object} categoryMapping - Mapeamento de campos para categorias
 * @param {Object} categoryNames - Nomes das categorias para exibição
 * @param {Object} categoryIcons - Ícones das categorias
 */
const createValidationHandler = (categoryMapping = {}, categoryNames = {}, categoryIcons = {}) => {
  return (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      // Organizar erros por categoria
      const errorCategories = {};
      
      // Inicializar categorias vazias
      Object.keys(categoryMapping).forEach(category => {
        errorCategories[category] = [];
      });
      
      // Categorizar erros
      errors.array().forEach(error => {
        const field = error.path;
        let categorized = false;
        
        // Tentar categorizar baseado no mapeamento
        for (const [category, fields] of Object.entries(categoryMapping)) {
          if (fields.includes(field)) {
            if (!errorCategories[category]) {
              errorCategories[category] = [];
            }
            errorCategories[category].push(error);
            categorized = true;
            break;
          }
        }
        
        // Se não foi categorizado, colocar em "geral"
        if (!categorized) {
          if (!errorCategories.geral) {
            errorCategories.geral = [];
          }
          errorCategories.geral.push(error);
        }
      });
      
      // Criar mensagem detalhada
      let detailedMessage = 'Dados inválidos:\n';
      Object.entries(errorCategories).forEach(([category, categoryErrors]) => {
        if (categoryErrors.length > 0) {
          const categoryName = categoryNames[category] || category;
          const icon = categoryIcons[category] || '•';
          
          detailedMessage += `\n${icon} ${categoryName}:\n`;
          categoryErrors.forEach(error => {
            detailedMessage += `  - ${error.msg}\n`;
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
};

/**
 * Mapeamentos padrão para diferentes tipos de entidades
 */
const defaultMappings = {
  // Mapeamento para entidades básicas (usuários, fornecedores, etc.)
  basic: {
    basicInfo: ['nome', 'email', 'status'],
    contact: ['telefone', 'email', 'cep'],
    address: ['logradouro', 'numero', 'bairro', 'municipio', 'uf', 'cep'],
    geral: []
  },
  
  // Mapeamento para entidades com classificação
  classification: {
    basicInfo: ['nome', 'codigo', 'status'],
    classification: ['grupo_id', 'subgrupo_id', 'classe_id', 'categoria_id'],
    geral: []
  },
  
  // Mapeamento para entidades de transporte
  transport: {
    basicInfo: ['nome', 'placa', 'status'],
    vehicle: ['marca', 'modelo', 'ano', 'cor'],
    driver: ['cnh', 'categoria_cnh', 'validade_cnh'],
    geral: []
  }
};

/**
 * Nomes padrão das categorias
 */
const defaultCategoryNames = {
  basicInfo: 'Informações Básicas',
  contact: 'Contato',
  address: 'Endereço',
  classification: 'Classificação',
  vehicle: 'Veículo',
  driver: 'Motorista',
  geral: 'Outros Campos'
};

/**
 * Ícones padrão das categorias
 */
const defaultCategoryIcons = {
  basicInfo: '📋',
  contact: '📞',
  address: '📍',
  classification: '🏷️',
  vehicle: '🚗',
  driver: '👤',
  geral: '⚠️'
};

module.exports = {
  createValidationHandler,
  defaultMappings,
  defaultCategoryNames,
  defaultCategoryIcons
};

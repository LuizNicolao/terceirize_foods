/**
 * Middleware Universal de Validação
 * Trata erros de validação de forma reutilizável em todas as rotas
 */

const { validationResult } = require('express-validator');

/**
 * Cria um handler de validação com categorização personalizada
 * @param {Object} categoryConfig - Configuração das categorias
 * @returns {Function} - Middleware de validação
 */
const createValidationHandler = (categoryConfig = {}) => {
  return (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Se não há configuração de categorias, retorna erros simples
      if (!categoryConfig.categories || Object.keys(categoryConfig.categories).length === 0) {
        return res.status(422).json({
          success: false,
          message: 'Dados inválidos',
          errors: errors.array()
        });
      }

      // Organizar erros por categoria
      const errorCategories = {};
      Object.keys(categoryConfig.categories).forEach(category => {
        errorCategories[category] = [];
      });

      errors.array().forEach(error => {
        const field = error.path;
        let categorized = false;

        // Categorizar erro baseado na configuração
        Object.entries(categoryConfig.categories).forEach(([category, fields]) => {
          if (fields.includes(field)) {
            errorCategories[category].push(error);
            categorized = true;
          }
        });

        // Se não foi categorizado, colocar na categoria padrão
        if (!categorized && categoryConfig.defaultCategory) {
          errorCategories[categoryConfig.defaultCategory].push(error);
        }
      });

      // Criar mensagem detalhada
      let detailedMessage = 'Dados inválidos:\n';
      Object.entries(errorCategories).forEach(([category, categoryErrors]) => {
        if (categoryErrors.length > 0) {
          const categoryName = categoryConfig.categoryNames?.[category] || category;
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
};

/**
 * Configurações pré-definidas para diferentes tipos de entidade
 */
const validationConfigs = {
  // Configuração para Usuários
  usuarios: {
    categories: {
      personalInfo: ['nome', 'email'],
      accessInfo: ['senha', 'nivel_de_acesso', 'tipo_de_acesso'],
      statusInfo: ['status']
    },
    categoryNames: {
      personalInfo: 'Informações Pessoais',
      accessInfo: 'Informações de Acesso',
      statusInfo: 'Status'
    },
    defaultCategory: 'personalInfo'
  },

  // Configuração para Permissões
  permissoes: {
    categories: {
      userInfo: ['usuario_id'],
      permissionInfo: ['tela', 'pode_visualizar', 'pode_criar', 'pode_editar', 'pode_excluir', 'pode_movimentar']
    },
    categoryNames: {
      userInfo: 'Informações do Usuário',
      permissionInfo: 'Informações de Permissão'
    },
    defaultCategory: 'userInfo'
  },

  // Configuração padrão para outras entidades
  default: {
    categories: {
      general: []
    },
    categoryNames: {
      general: 'Campos Gerais'
    },
    defaultCategory: 'general'
  }
};

/**
 * Cria handler de validação para uma entidade específica
 * @param {string} entityType - Tipo da entidade (usuarios, permissoes, etc.)
 * @returns {Function} - Middleware de validação
 */
const createEntityValidationHandler = (entityType) => {
  const config = validationConfigs[entityType] || validationConfigs.default;
  return createValidationHandler(config);
};

module.exports = {
  createValidationHandler,
  createEntityValidationHandler,
  validationConfigs
};

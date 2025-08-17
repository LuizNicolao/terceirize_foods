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
  // Configuração para Produtos (mantém a atual)
  produtos: {
    categories: {
      basicInfo: ['nome', 'codigo_produto', 'codigo_barras', 'fator_conversao', 'status'],
      classification: ['unidade_id', 'grupo_id', 'subgrupo_id', 'classe_id', 'nome_generico_id', 'produto_origem_id', 'marca_id'],
      dimensions: ['peso_liquido', 'peso_bruto', 'comprimento', 'largura', 'altura', 'volume', 'regra_palet_un'],
      taxation: ['ncm', 'cest', 'cfop', 'ean', 'cst_icms', 'csosn', 'aliquota_icms', 'aliquota_ipi', 'aliquota_pis', 'aliquota_cofins'],
      documents: ['ficha_homologacao', 'registro_especifico', 'tipo_registro', 'prazo_validade', 'unidade_validade'],
      references: ['referencia_interna', 'referencia_externa', 'referencia_mercado', 'integracao_senior']
    },
    categoryNames: {
      basicInfo: 'Informações Básicas',
      classification: 'Classificação',
      dimensions: 'Dimensões e Pesos',
      taxation: 'Tributação',
      documents: 'Documentos e Registros',
      references: 'Referências'
    },
    defaultCategory: 'references'
  },

  // Configuração para Rotas
  rotas: {
    categories: {
      basicInfo: ['nome', 'codigo', 'status'],
      routeInfo: ['tipo_rota', 'filial_id', 'observacoes'],
      schedule: ['frequencia', 'dia_semana', 'data_inicio', 'data_fim'],
      metrics: ['distancia_km', 'custo_diario']
    },
    categoryNames: {
      basicInfo: 'Informações Básicas',
      routeInfo: 'Informações da Rota',
      schedule: 'Agendamento',
      metrics: 'Métricas da Rota'
    },
    defaultCategory: 'basicInfo'
  },

  // Configuração para Usuários
  usuarios: {
    categories: {
      personalInfo: ['nome', 'email'],
      accessInfo: ['senha', 'nivel_de_acesso', 'tipo_de_acesso'],
      contactInfo: ['telefone', 'endereco']
    },
    categoryNames: {
      personalInfo: 'Informações Pessoais',
      accessInfo: 'Informações de Acesso',
      contactInfo: 'Informações de Contato'
    },
    defaultCategory: 'personalInfo'
  },

  // Configuração para Fornecedores
  fornecedores: {
    categories: {
      basicInfo: ['razao_social', 'nome_fantasia', 'cnpj', 'status'],
      contactInfo: ['telefone', 'email', 'website'],
      addressInfo: ['logradouro', 'numero', 'bairro', 'municipio', 'uf', 'cep']
    },
    categoryNames: {
      basicInfo: 'Informações Básicas',
      contactInfo: 'Informações de Contato',
      addressInfo: 'Endereço'
    },
    defaultCategory: 'basicInfo'
  },

  // Configuração para Clientes
  clientes: {
    categories: {
      basicInfo: ['razao_social', 'nome_fantasia', 'cnpj', 'status'],
      contactInfo: ['telefone', 'email', 'contato'],
      addressInfo: ['logradouro', 'numero', 'bairro', 'municipio', 'uf', 'cep']
    },
    categoryNames: {
      basicInfo: 'Informações Básicas',
      contactInfo: 'Informações de Contato',
      addressInfo: 'Endereço'
    },
    defaultCategory: 'basicInfo'
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
 * @param {string} entityType - Tipo da entidade (produtos, rotas, usuarios, etc.)
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

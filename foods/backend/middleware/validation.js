/**
 * Middleware universal para validação
 * Padroniza o tratamento de erros de validação em todas as rotas
 */

const { validationResult } = require('express-validator');

/**
 * Middleware para tratar erros de validação com categorização automática
 * @param {Object} categoryMapping - Mapeamento de campos para categorias
 * @param {Object} categoryNames - Nomes das categorias para exibição
 * @param {Object} categoryIcons - Ícones das categorias
 */
const handleValidationErrors = (categoryMapping = {}, categoryNames = {}, categoryIcons = {}) => {
  return (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Organizar erros por categoria
      const errorCategories = {};
      
      errors.array().forEach(error => {
        const field = error.path;
        let category = 'general'; // categoria padrão
        
        // Determinar categoria baseada no mapeamento
        for (const [cat, fields] of Object.entries(categoryMapping)) {
          if (fields.includes(field)) {
            category = cat;
            break;
          }
        }
        
        // Inicializar categoria se não existir
        if (!errorCategories[category]) {
          errorCategories[category] = [];
        }
        
        errorCategories[category].push(error);
      });

      // Criar mensagem detalhada
      let detailedMessage = 'Dados inválidos:\n';
      Object.entries(errorCategories).forEach(([category, categoryErrors]) => {
        if (categoryErrors.length > 0) {
          const categoryName = categoryNames[category] || 'Geral';
          const categoryIcon = categoryIcons[category] || '⚠️';
          
          detailedMessage += `\n${categoryIcon} ${categoryName}:\n`;
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
 * Mapeamentos padrão para diferentes tipos de entidades
 */
const defaultCategoryMappings = {
  // Para usuários
  usuarios: {
    personalInfo: ['nome', 'email', 'senha'],
    accessInfo: ['tipo_de_acesso', 'nivel_de_acesso', 'status']
  },
  
  // Para fornecedores
  fornecedores: {
    basicInfo: ['razao_social', 'nome_fantasia', 'cnpj'],
    contactInfo: ['telefone', 'email'],
    addressInfo: ['logradouro', 'numero', 'bairro', 'municipio', 'uf', 'cep']
  },
  
  // Para clientes
  clientes: {
    basicInfo: ['razao_social', 'nome_fantasia', 'cnpj'],
    contactInfo: ['telefone', 'email'],
    addressInfo: ['logradouro', 'numero', 'bairro', 'municipio', 'uf', 'cep']
  },
  
  // Para filiais
  filiais: {
    basicInfo: ['nome', 'codigo'],
    contactInfo: ['telefone', 'email'],
    addressInfo: ['logradouro', 'numero', 'bairro', 'municipio', 'uf', 'cep']
  },
  
  // Para rotas
  rotas: {
    basicInfo: ['nome', 'codigo'],
    routeInfo: ['origem', 'destino', 'distancia']
  },
  
  // Para unidades escolares
  unidadesEscolares: {
    basicInfo: ['nome', 'codigo'],
    contactInfo: ['telefone', 'email'],
    addressInfo: ['logradouro', 'numero', 'bairro', 'municipio', 'uf', 'cep']
  },
  
  // Para grupos
  grupos: {
    basicInfo: ['nome', 'codigo']
  },
  
  // Para subgrupos
  subgrupos: {
    basicInfo: ['nome', 'codigo', 'grupo_id']
  },
  
  // Para unidades
  unidades: {
    basicInfo: ['nome', 'sigla']
  },
  
  // Para marcas
  marcas: {
    basicInfo: ['marca', 'fabricante']
  },
  
  // Para classes
  classes: {
    basicInfo: ['nome', 'codigo', 'subgrupo_id']
  },
  
  // Para veículos
  veiculos: {
    basicInfo: ['placa', 'modelo', 'marca'],
    technicalInfo: ['ano', 'capacidade', 'tipo']
  },
  
  // Para motoristas
  motoristas: {
    personalInfo: ['nome', 'cpf', 'cnh'],
    contactInfo: ['telefone', 'email']
  },
  
  // Para ajudantes
  ajudantes: {
    personalInfo: ['nome', 'cpf'],
    contactInfo: ['telefone', 'email']
  },
  
  // Para produto origem
  produtoOrigem: {
    basicInfo: ['codigo', 'nome']
  },
  
  // Para produto genérico
  produtoGenerico: {
    basicInfo: ['nome', 'grupo_id', 'subgrupo_id', 'classe_id']
  }
};

/**
 * Nomes padrão das categorias
 */
const defaultCategoryNames = {
  personalInfo: 'Informações Pessoais',
  basicInfo: 'Informações Básicas',
  contactInfo: 'Informações de Contato',
  addressInfo: 'Endereço',
  accessInfo: 'Informações de Acesso',
  routeInfo: 'Informações da Rota',
  technicalInfo: 'Informações Técnicas',
  general: 'Geral'
};

/**
 * Ícones padrão das categorias
 */
const defaultCategoryIcons = {
  personalInfo: '👤',
  basicInfo: '📋',
  contactInfo: '📞',
  addressInfo: '📍',
  accessInfo: '🔐',
  routeInfo: '🛣️',
  technicalInfo: '⚙️',
  general: '⚠️'
};

module.exports = {
  handleValidationErrors,
  defaultCategoryMappings,
  defaultCategoryNames,
  defaultCategoryIcons
}; 
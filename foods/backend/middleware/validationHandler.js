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
      routeInfo: ['frequencia_entrega', 'filial_id', 'observacoes'],
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

  // Configuração para Tipo de Rota
  tipo_rota: {
    categories: {
      basicInfo: ['nome', 'status'],
      routeInfo: ['filial_id', 'grupo_id'],
      additionalInfo: ['observacoes']
    },
    categoryNames: {
      basicInfo: 'Informações Básicas',
      routeInfo: 'Informações da Rota',
      additionalInfo: 'Informações Adicionais'
    },
    defaultCategory: 'basicInfo'
  },

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

  // Configuração para Fornecedores
  fornecedores: {
    categories: {
      companyInfo: ['cnpj', 'razao_social', 'nome_fantasia'],
      contactInfo: ['email', 'telefone'],
      addressInfo: ['logradouro', 'numero', 'cep', 'bairro', 'municipio', 'uf'],
      statusInfo: ['status']
    },
    categoryNames: {
      companyInfo: 'Informações da Empresa',
      contactInfo: 'Informações de Contato',
      addressInfo: 'Endereço',
      statusInfo: 'Status'
    },
    defaultCategory: 'companyInfo'
  },

  // Configuração para Clientes
  clientes: {
    categories: {
      companyInfo: ['cnpj', 'razao_social', 'nome_fantasia'],
      contactInfo: ['email', 'telefone'],
      addressInfo: ['logradouro', 'numero', 'cep', 'bairro', 'municipio', 'uf', 'pais'],
      statusInfo: ['status'],
      additionalInfo: ['observacoes']
    },
    categoryNames: {
      companyInfo: 'Informações da Empresa',
      contactInfo: 'Informações de Contato',
      addressInfo: 'Endereço',
      statusInfo: 'Status',
      additionalInfo: 'Observações'
    },
    defaultCategory: 'companyInfo'
  },

  // Configuração para Unidades Escolares
  unidades_escolares: {
    categories: {
      basicInfo: ['codigo_teknisa', 'nome_escola', 'status'],
      locationInfo: ['cidade', 'estado', 'pais', 'endereco', 'numero', 'bairro', 'cep'],
      operationalInfo: ['centro_distribuicao', 'rota_id', 'regional', 'abastecimento', 'ordem_entrega'],
      seniorInfo: ['cc_senior', 'codigo_senior', 'lot'],
      scheduleInfo: ['atendimento', 'horario'],
      additionalInfo: ['observacoes']
    },
    categoryNames: {
      basicInfo: 'Informações Básicas',
      locationInfo: 'Localização',
      operationalInfo: 'Informações Operacionais',
      seniorInfo: 'Informações Senior',
      scheduleInfo: 'Horários e Atendimento',
      additionalInfo: 'Informações Adicionais'
    },
    defaultCategory: 'basicInfo'
  },

  // Configuração para Veículos
  veiculos: {
    categories: {
      basicInfo: ['placa', 'renavam', 'chassi', 'modelo', 'marca', 'fabricante', 'ano_fabricacao', 'status'],
      technicalInfo: ['tipo_veiculo', 'carroceria', 'combustivel', 'categoria', 'tipo_tracao', 'numero_eixos'],
      capacityInfo: ['capacidade_carga', 'capacidade_volume', 'tara', 'peso_bruto_total', 'potencia_motor'],
      maintenanceInfo: ['quilometragem_atual', 'data_ultima_revisao', 'quilometragem_proxima_revisao', 'data_ultima_troca_oleo'],
      documentationInfo: ['data_emplacamento', 'vencimento_licenciamento', 'vencimento_ipva', 'vencimento_dpvat', 'situacao_documental'],
      financialInfo: ['data_aquisicao', 'valor_compra', 'fornecedor', 'numero_frota', 'situacao_financeira'],
      additionalInfo: ['observacoes']
    },
    categoryNames: {
      basicInfo: 'Informações Básicas',
      technicalInfo: 'Informações Técnicas',
      capacityInfo: 'Capacidades e Pesos',
      maintenanceInfo: 'Manutenção',
      documentationInfo: 'Documentação',
      financialInfo: 'Informações Financeiras',
      additionalInfo: 'Informações Adicionais'
    },
    defaultCategory: 'basicInfo'
  },

  // Configuração para Motoristas
  motoristas: {
    categories: {
      personalInfo: ['nome', 'cpf', 'telefone', 'email'],
      documentationInfo: ['cnh', 'categoria_cnh', 'cnh_validade', 'data_admissao'],
      locationInfo: ['endereco', 'filial_id'],
      statusInfo: ['status'],
      additionalInfo: ['observacoes']
    },
    categoryNames: {
      personalInfo: 'Informações Pessoais',
      documentationInfo: 'Documentação',
      locationInfo: 'Localização e Status',
      statusInfo: 'Status',
      additionalInfo: 'Observações'
    },
    defaultCategory: 'personalInfo'
  },

  // Configuração para Ajudantes
  ajudantes: {
    categories: {
      personalInfo: ['nome', 'cpf', 'telefone', 'email'],
      professionalInfo: ['data_admissao', 'status', 'filial_id'],
      addressInfo: ['endereco'],
      additionalInfo: ['observacoes']
    },
    categoryNames: {
      personalInfo: 'Informações Pessoais',
      professionalInfo: 'Informações Profissionais',
      addressInfo: 'Endereço',
      additionalInfo: 'Observações'
    },
    defaultCategory: 'personalInfo'
  },

  // Configuração para Filiais
  filiais: {
    categories: {
      companyInfo: ['filial', 'razao_social', 'cnpj', 'codigo_filial'],
      addressInfo: ['logradouro', 'numero', 'bairro', 'cidade', 'estado', 'cep'],
      organizationalInfo: ['supervisao', 'coordenacao'],
      statusInfo: ['status']
    },
    categoryNames: {
      companyInfo: 'Informações da Empresa',
      addressInfo: 'Endereço',
      organizationalInfo: 'Informações Organizacionais',
      statusInfo: 'Status'
    },
    defaultCategory: 'companyInfo'
  },

  // Configuração para Grupos
  grupos: {
    categories: {
      basicInfo: ['nome'],
      additionalInfo: ['descricao'],
      statusInfo: ['status']
    },
    categoryNames: {
      basicInfo: 'Informações Básicas',
      additionalInfo: 'Informações Adicionais',
      statusInfo: 'Status'
    },
    defaultCategory: 'basicInfo'
  },

  // Configuração para Subgrupos
  subgrupos: {
    categories: {
      basicInfo: ['nome'],
      classification: ['grupo_id'],
      additionalInfo: ['descricao'],
      statusInfo: ['status']
    },
    categoryNames: {
      basicInfo: 'Informações Básicas',
      classification: 'Classificação',
      additionalInfo: 'Informações Adicionais',
      statusInfo: 'Status'
    },
    defaultCategory: 'basicInfo'
  },

  // Configuração para Classes
  classes: {
    categories: {
      basicInfo: ['nome'],
      classification: ['subgrupo_id'],
      additionalInfo: ['descricao'],
      statusInfo: ['status']
    },
    categoryNames: {
      basicInfo: 'Informações Básicas',
      classification: 'Classificação',
      additionalInfo: 'Informações Adicionais',
      statusInfo: 'Status'
    },
    defaultCategory: 'basicInfo'
  },

  // Configuração para Unidades
  unidades: {
    categories: {
      basicInfo: ['nome', 'sigla'],
      statusInfo: ['status']
    },
    categoryNames: {
      basicInfo: 'Informações Básicas',
      statusInfo: 'Status'
    },
    defaultCategory: 'basicInfo'
  },

  // Configuração para Marcas
  marcas: {
    categories: {
      basicInfo: ['marca', 'fabricante'],
      statusInfo: ['status']
    },
    categoryNames: {
      basicInfo: 'Informações Básicas',
      statusInfo: 'Status'
    },
    defaultCategory: 'basicInfo'
  },

  // Configuração para Produto Origem
  'produto-origem': {
    categories: {
      basicInfo: ['nome', 'codigo'],
      measurementInfo: ['unidade_medida_id', 'fator_conversao'],
      classification: ['grupo_id', 'subgrupo_id', 'classe_id'],
      technicalInfo: ['peso_liquido', 'referencia_mercado'],
      references: ['produto_generico_padrao_id'],
      statusInfo: ['status']
    },
    categoryNames: {
      basicInfo: 'Informações Básicas',
      measurementInfo: 'Medidas',
      classification: 'Classificação',
      technicalInfo: 'Informações Técnicas',
      references: 'Referências',
      statusInfo: 'Status'
    },
    defaultCategory: 'basicInfo'
  },

  // Configuração para Produto Genérico
  'produto-generico': {
    categories: {
      basicInfo: ['nome', 'codigo'],
      references: ['produto_origem_id'],
      measurementInfo: ['fator_conversao', 'unidade_medida_id'],
      classification: ['grupo_id', 'subgrupo_id', 'classe_id'],
      technicalInfo: ['peso_liquido', 'peso_bruto', 'regra_palet'],
      marketInfo: ['referencia_mercado', 'produto_padrao'],
      additionalInfo: ['informacoes_adicionais'],
      referenceDetails: ['referencia_interna', 'referencia_externa', 'registro_especifico', 'tipo_registro'],
      validityInfo: ['prazo_validade_padrao', 'unidade_validade'],
      integrationInfo: ['integracao_senior'],
      statusInfo: ['status']
    },
    categoryNames: {
      basicInfo: 'Informações Básicas',
      references: 'Referências',
      measurementInfo: 'Medidas',
      classification: 'Classificação',
      technicalInfo: 'Informações Técnicas',
      marketInfo: 'Informações de Mercado',
      additionalInfo: 'Informações Adicionais',
      referenceDetails: 'Detalhes de Referência',
      validityInfo: 'Validade',
      integrationInfo: 'Integração',
      statusInfo: 'Status'
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

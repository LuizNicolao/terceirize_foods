/**
 * Configuração dos Campos do Produto
 * Centraliza a definição de todos os campos do formulário
 */

export const PRODUTO_FIELDS = {
  // Informações Básicas
  basicInfo: [
    {
      name: 'codigo_produto',
      label: 'Código do Produto',
      type: 'text',
      placeholder: 'Código gerado automaticamente',
      disabled: true,
      required: false
    },
    {
      name: 'nome',
      label: 'Nome do Produto',
      type: 'text',
      placeholder: 'Ex: PATINHO BOVINO EM CUBOS KING',
      required: true,
      validation: { minLength: 3, maxLength: 200 }
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: false,
      options: [
        { value: 1, label: 'Ativo' },
        { value: 0, label: 'Inativo' }
      ]
    },
    {
      name: 'codigo_barras',
      label: 'Código de Barras',
      type: 'text',
      placeholder: 'Ex: 1234567891234',
      required: false,
      validation: { minLength: 8, maxLength: 50 }
    },
    {
      name: 'fator_conversao',
      label: 'Fator de Conversão',
      type: 'number',
      placeholder: '1.000',
      required: false,
      validation: { min: 0.01 }
    }
  ],

  // Classificação
  classification: [
    {
      name: 'unidade_id',
      label: 'Unidade',
      type: 'select',
      required: false,
      placeholder: 'Selecione a unidade'
    },
    {
      name: 'grupo_id',
      label: 'Grupo',
      type: 'select',
      required: false,
      placeholder: 'Selecione o grupo'
    },
    {
      name: 'subgrupo_id',
      label: 'Subgrupo',
      type: 'select',
      required: false,
      placeholder: 'Selecione o subgrupo',
      dependsOn: 'grupo_id'
    },
    {
      name: 'classe_id',
      label: 'Classe',
      type: 'select',
      required: false,
      placeholder: 'Selecione a classe',
      dependsOn: 'subgrupo_id'
    },
    {
      name: 'nome_generico_id',
      label: 'Produto Genérico',
      type: 'select',
      required: false,
      placeholder: 'Selecione o produto genérico'
    },
    {
      name: 'produto_origem_id',
      label: 'Produto Origem',
      type: 'select',
      required: false,
      placeholder: 'Selecione o produto origem'
    },
    {
      name: 'marca_id',
      label: 'Marca',
      type: 'select',
      required: false,
      placeholder: 'Selecione a marca'
    }
  ],

  // Dimensões e Pesos
  dimensions: [
    {
      name: 'peso_liquido',
      label: 'Peso Líquido (kg)',
      type: 'number',
      placeholder: '0.000',
      required: false,
      validation: { min: 0 }
    },
    {
      name: 'peso_bruto',
      label: 'Peso Bruto (kg)',
      type: 'number',
      placeholder: '0.000',
      required: false,
      validation: { min: 0 }
    },
    {
      name: 'comprimento',
      label: 'Comprimento (cm)',
      type: 'number',
      placeholder: '0.00',
      required: false,
      validation: { min: 0 }
    },
    {
      name: 'largura',
      label: 'Largura (cm)',
      type: 'number',
      placeholder: '0.00',
      required: false,
      validation: { min: 0 }
    },
    {
      name: 'altura',
      label: 'Altura (cm)',
      type: 'number',
      placeholder: '0.00',
      required: false,
      validation: { min: 0 }
    },
    {
      name: 'volume',
      label: 'Volume (cm³)',
      type: 'number',
      placeholder: '0.00',
      required: false,
      validation: { min: 0 }
    },
    {
      name: 'regra_palet_un',
      label: 'Regra Palet (UN)',
      type: 'number',
      placeholder: '0',
      required: false,
      validation: { min: 1 }
    }
  ],

  // Tributação
  taxation: [
    {
      name: 'ncm',
      label: 'NCM',
      type: 'text',
      placeholder: 'Ex: 0201.20.00',
      required: false,
      validation: { minLength: 1, maxLength: 10 }
    },
    {
      name: 'cest',
      label: 'CEST',
      type: 'text',
      placeholder: 'Ex: 28.001.00',
      required: false,
      validation: { minLength: 1, maxLength: 10 }
    },
    {
      name: 'cfop',
      label: 'CFOP',
      type: 'text',
      placeholder: 'Ex: 5102',
      required: false,
      validation: { minLength: 1, maxLength: 10 }
    },
    {
      name: 'ean',
      label: 'EAN',
      type: 'text',
      placeholder: 'Ex: 7891234567890',
      required: false,
      validation: { minLength: 1, maxLength: 50 }
    },
    {
      name: 'cst_icms',
      label: 'CST ICMS',
      type: 'text',
      placeholder: 'Ex: 000',
      required: false,
      validation: { minLength: 1, maxLength: 3 }
    },
    {
      name: 'csosn',
      label: 'CSOSN',
      type: 'text',
      placeholder: 'Ex: 101',
      required: false,
      validation: { minLength: 1, maxLength: 3 }
    },
    {
      name: 'aliquota_icms',
      label: 'Alíquota ICMS (%)',
      type: 'number',
      placeholder: '0.00',
      required: false,
      validation: { min: 0, max: 100 }
    },
    {
      name: 'aliquota_ipi',
      label: 'Alíquota IPI (%)',
      type: 'number',
      placeholder: '0.00',
      required: false,
      validation: { min: 0, max: 100 }
    },
    {
      name: 'aliquota_pis',
      label: 'Alíquota PIS (%)',
      type: 'number',
      placeholder: '0.00',
      required: false,
      validation: { min: 0, max: 100 }
    },
    {
      name: 'aliquota_cofins',
      label: 'Alíquota COFINS (%)',
      type: 'number',
      placeholder: '0.00',
      required: false,
      validation: { min: 0, max: 100 }
    }
  ],

  // Documentos e Registros
  documents: [
    {
      name: 'ficha_homologacao',
      label: 'Ficha de Homologação',
      type: 'text',
      placeholder: 'Ex: FH001',
      required: false,
      validation: { minLength: 1, maxLength: 50 }
    },
    {
      name: 'registro_especifico',
      label: 'Registro Específico',
      type: 'text',
      placeholder: 'Ex: RE123456',
      required: false,
      validation: { minLength: 1, maxLength: 200 }
    },
    {
      name: 'tipo_registro',
      label: 'Tipo de Registro',
      type: 'select',
      required: false,
      options: [
        { value: 'ANVISA', label: 'ANVISA' },
        { value: 'MAPA', label: 'MAPA' },
        { value: 'OUTROS', label: 'OUTROS' }
      ]
    },
    {
      name: 'prazo_validade',
      label: 'Prazo de Validade',
      type: 'number',
      placeholder: 'Ex: 30',
      required: false,
      validation: { min: 1 }
    },
    {
      name: 'unidade_validade',
      label: 'Unidade de Validade',
      type: 'select',
      required: false,
      options: [
        { value: 'DIAS', label: 'Dias' },
        { value: 'SEMANAS', label: 'Semanas' },
        { value: 'MESES', label: 'Meses' },
        { value: 'ANOS', label: 'Anos' }
      ]
    }
  ],

  // Referências
  references: [
    {
      name: 'referencia_interna',
      label: 'Referência Interna',
      type: 'text',
      placeholder: 'Ex: REF001',
      required: false,
      validation: { minLength: 1, maxLength: 100 }
    },
    {
      name: 'referencia_externa',
      label: 'Referência Externa',
      type: 'text',
      placeholder: 'Ex: EXT001',
      required: false,
      validation: { minLength: 1, maxLength: 100 }
    },
    {
      name: 'referencia_mercado',
      label: 'Referência de Mercado',
      type: 'text',
      placeholder: 'Ex: MER001',
      required: false,
      validation: { minLength: 1, maxLength: 200 }
    },
    {
      name: 'fabricante',
      label: 'Fabricante',
      type: 'text',
      placeholder: 'Ex: Empresa XYZ Ltda',
      required: false,
      validation: { minLength: 1, maxLength: 100 }
    },
    {
      name: 'informacoes_adicionais',
      label: 'Informações Adicionais',
      type: 'textarea',
      placeholder: 'Ex: PRODUTO COM 5% DE GORDURA',
      required: false,
      validation: { minLength: 1, maxLength: 1000 }
    },
    {
      name: 'foto_produto',
      label: 'Foto do Produto',
      type: 'text',
      placeholder: 'URL da foto',
      required: false,
      validation: { minLength: 1, maxLength: 255 }
    },
    {
      name: 'integracao_senior',
      label: 'Integração Senior',
      type: 'text',
      placeholder: 'Ex: SEN001',
      required: false,
      validation: { minLength: 1, maxLength: 50 }
    },
    {
      name: 'embalagem_secundaria_id',
      label: 'Embalagem Secundária',
      type: 'select',
      required: false,
      placeholder: 'Selecione a embalagem'
    },
    {
      name: 'fator_conversao_embalagem',
      label: 'Fator de Conversão da Embalagem',
      type: 'number',
      placeholder: '1',
      required: false,
      validation: { min: 1 }
    }
  ]
};

// Configurações de layout
export const PRODUTO_LAYOUT = {
  sections: [
    {
      title: 'Informação Básica',
      icon: '📋',
      fields: PRODUTO_FIELDS.basicInfo,
      columns: 1
    },
    {
      title: 'Classificação',
      icon: '🏷️',
      fields: PRODUTO_FIELDS.classification,
      columns: 2
    },
    {
      title: 'Dimensões e Pesos',
      icon: '📏',
      fields: PRODUTO_FIELDS.dimensions,
      columns: 2
    },
    {
      title: 'Tributação',
      icon: '💰',
      fields: PRODUTO_FIELDS.taxation,
      columns: 2
    },
    {
      title: 'Documentos e Registros',
      icon: '📄',
      fields: PRODUTO_FIELDS.documents,
      columns: 2
    },
    {
      title: 'Referências',
      icon: '🔗',
      fields: PRODUTO_FIELDS.references,
      columns: 2
    }
  ]
};

// Funções auxiliares
export const getFieldByName = (name) => {
  for (const category of Object.values(PRODUTO_FIELDS)) {
    const field = category.find(f => f.name === name);
    if (field) return field;
  }
  return null;
};

export const getFieldsByCategory = (category) => {
  return PRODUTO_FIELDS[category] || [];
};

export const getRequiredFields = () => {
  const required = [];
  for (const category of Object.values(PRODUTO_FIELDS)) {
    category.forEach(field => {
      if (field.required) {
        required.push(field.name);
      }
    });
  }
  return required;
};

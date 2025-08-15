/**
 * Esquemas de validação padronizados para formulários
 */

// Validações para Produto Origem
export const produtoOrigemValidations = {
  codigo: {
    required: 'Código é obrigatório',
    minLength: { value: 1, message: 'Código deve ter pelo menos 1 caractere' },
    maxLength: { value: 20, message: 'Código deve ter no máximo 20 caracteres' },
    pattern: { 
      value: /^[a-zA-Z0-9\-_]+$/, 
      message: 'Código deve conter apenas letras, números, hífens e underscores' 
    }
  },
  
  nome: {
    required: 'Nome é obrigatório',
    minLength: { value: 3, message: 'Nome deve ter pelo menos 3 caracteres' },
    maxLength: { value: 200, message: 'Nome deve ter no máximo 200 caracteres' },
    pattern: { 
      value: /^[a-zA-ZÀ-ÿ\s]+$/, 
      message: 'Nome deve conter apenas letras e espaços' 
    }
  },
  
  unidade_medida_id: {
    required: 'Unidade de medida é obrigatória',
    validate: (value) => {
      if (!value || value === '' || value === 'null') {
        return 'Unidade de medida é obrigatória';
      }
      return true;
    }
  },
  
  fator_conversao: {
    min: { value: 0.001, message: 'Fator de conversão deve ser maior que 0' },
    max: { value: 999999.999, message: 'Fator de conversão deve ser menor que 999999.999' },
    validate: (value) => {
      if (!value || value === '') return true; // Campo opcional
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        return 'Fator de conversão deve ser um número válido';
      }
      if (numValue < 0.001 || numValue > 999999.999) {
        return 'Fator de conversão deve estar entre 0.001 e 999999.999';
      }
      return true;
    }
  },
  
  grupo_id: {
    validate: (value) => {
      if (!value || value === '' || value === 'null') return true; // Campo opcional
      const numValue = parseInt(value);
      if (isNaN(numValue) || numValue < 1) {
        return 'Grupo deve ser selecionado';
      }
      return true;
    }
  },
  
  subgrupo_id: {
    validate: (value) => {
      if (!value || value === '' || value === 'null') return true; // Campo opcional
      const numValue = parseInt(value);
      if (isNaN(numValue) || numValue < 1) {
        return 'Subgrupo deve ser selecionado';
      }
      return true;
    }
  },
  
  classe_id: {
    validate: (value) => {
      if (!value || value === '' || value === 'null') return true; // Campo opcional
      const numValue = parseInt(value);
      if (isNaN(numValue) || numValue < 1) {
        return 'Classe deve ser selecionada';
      }
      return true;
    }
  },
  
  peso_liquido: {
    min: { value: 0.001, message: 'Peso líquido deve ser maior que 0' },
    max: { value: 999999.999, message: 'Peso líquido deve ser menor que 999999.999' },
    validate: (value) => {
      if (!value || value === '') return true; // Campo opcional
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        return 'Peso líquido deve ser um número válido';
      }
      if (numValue < 0.001 || numValue > 999999.999) {
        return 'Peso líquido deve estar entre 0.001 e 999999.999';
      }
      return true;
    }
  },
  
  referencia_mercado: {
    maxLength: { value: 200, message: 'Referência de mercado deve ter no máximo 200 caracteres' },
    validate: (value) => {
      if (!value || value === '') return true; // Campo opcional
      if (value.length > 200) {
        return 'Referência de mercado deve ter no máximo 200 caracteres';
      }
      return true;
    }
  },
  
  produto_generico_padrao_id: {
    validate: (value) => {
      if (!value || value === '' || value === 'null') return true; // Campo opcional
      const numValue = parseInt(value);
      if (isNaN(numValue) || numValue < 1) {
        return 'Produto genérico padrão deve ser selecionado';
      }
      return true;
    }
  },
  
  status: {
    validate: (value) => {
      if (!value || value === '') return true; // Campo opcional
      const numValue = parseInt(value);
      if (isNaN(numValue) || (numValue !== 0 && numValue !== 1)) {
        return 'Status deve ser 0 (inativo) ou 1 (ativo)';
      }
      return true;
    }
  }
};

// Validações para outros módulos podem ser adicionadas aqui
export const motoristaValidations = {
  nome: {
    required: 'Nome é obrigatório',
    minLength: { value: 2, message: 'Nome deve ter pelo menos 2 caracteres' },
    maxLength: { value: 100, message: 'Nome deve ter no máximo 100 caracteres' }
  },
  
  cpf: {
    pattern: { 
      value: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 
      message: 'CPF deve estar no formato 000.000.000-00' 
    }
  },
  
  telefone: {
    pattern: { 
      value: /^\(\d{2}\) \d{4,5}-\d{4}$/, 
      message: 'Telefone deve estar no formato (00) 00000-0000' 
    }
  },
  
  email: {
    pattern: { 
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 
      message: 'Email deve ser um email válido' 
    }
  }
};

export const clienteValidations = {
  cnpj: {
    required: 'CNPJ é obrigatório',
    pattern: { 
      value: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, 
      message: 'CNPJ deve estar no formato 00.000.000/0000-00' 
    }
  },
  
  razao_social: {
    required: 'Razão social é obrigatória',
    minLength: { value: 2, message: 'Razão social deve ter pelo menos 2 caracteres' },
    maxLength: { value: 200, message: 'Razão social deve ter no máximo 200 caracteres' }
  },
  
  cep: {
    pattern: { 
      value: /^\d{5}-\d{3}$/, 
      message: 'CEP deve estar no formato 00000-000' 
    }
  }
};

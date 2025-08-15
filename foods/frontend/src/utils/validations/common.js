/**
 * Validações comuns reutilizáveis
 */

export const commonValidations = {
  // Validações de texto
  required: (message = 'Campo obrigatório') => ({
    required: message
  }),

  minLength: (min, message) => ({
    minLength: { value: min, message }
  }),

  maxLength: (max, message) => ({
    maxLength: { value: max, message }
  }),

  // Validações de números
  min: (min, message) => ({
    min: { value: min, message }
  }),

  max: (max, message) => ({
    max: { value: max, message }
  }),

  // Validações de padrão
  pattern: (regex, message) => ({
    pattern: { value: regex, message }
  }),

  // Validações de email
  email: {
    pattern: { 
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 
      message: 'Email deve ser um email válido' 
    }
  },

  // Validações de CPF
  cpf: {
    pattern: { 
      value: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 
      message: 'CPF deve estar no formato 000.000.000-00' 
    }
  },

  // Validações de CNPJ
  cnpj: {
    pattern: { 
      value: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, 
      message: 'CNPJ deve estar no formato 00.000.000/0000-00' 
    }
  },

  // Validações de telefone
  telefone: {
    pattern: { 
      value: /^\(\d{2}\) \d{4,5}-\d{4}$/, 
      message: 'Telefone deve estar no formato (00) 00000-0000' 
    }
  },

  // Validações de CEP
  cep: {
    pattern: { 
      value: /^\d{5}-\d{3}$/, 
      message: 'CEP deve estar no formato 00000-000' 
    }
  },

  // Validações de placa
  placa: {
    pattern: { 
      value: /^[A-Z]{3}-\d{4}$|^[A-Z]{3}\d{1}[A-Z]{1}\d{2}$/, 
      message: 'Placa deve estar no formato ABC-1234 ou ABC1D23' 
    }
  }
};

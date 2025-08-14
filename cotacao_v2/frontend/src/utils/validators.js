// Utilitários de validação genéricos

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateCPF = (cpf) => {
  // Remove caracteres não numéricos
  const numbers = cpf.replace(/\D/g, '');
  
  // Verifica se tem 11 dígitos
  if (numbers.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(numbers)) return false;
  
  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numbers[i]) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(numbers[9])) return false;
  
  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numbers[i]) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(numbers[10])) return false;
  
  return true;
};

export const validateCNPJ = (cnpj) => {
  // Remove caracteres não numéricos
  const numbers = cnpj.replace(/\D/g, '');
  
  // Verifica se tem 14 dígitos
  if (numbers.length !== 14) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{13}$/.test(numbers)) return false;
  
  // Validação do primeiro dígito verificador
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(numbers[i]) * weights1[i];
  }
  let remainder = sum % 11;
  let digit1 = remainder < 2 ? 0 : 11 - remainder;
  if (digit1 !== parseInt(numbers[12])) return false;
  
  // Validação do segundo dígito verificador
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(numbers[i]) * weights2[i];
  }
  remainder = sum % 11;
  let digit2 = remainder < 2 ? 0 : 11 - remainder;
  if (digit2 !== parseInt(numbers[13])) return false;
  
  return true;
};

export const validatePhone = (phone) => {
  // Remove caracteres não numéricos
  const numbers = phone.replace(/\D/g, '');
  
  // Verifica se tem 10 ou 11 dígitos
  return numbers.length === 10 || numbers.length === 11;
};

export const validateRequired = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

export const validateMinLength = (value, minLength) => {
  if (!value) return false;
  return value.length >= minLength;
};

export const validateMaxLength = (value, maxLength) => {
  if (!value) return true;
  return value.length <= maxLength;
};

export const validateNumeric = (value) => {
  if (!value) return true;
  return !isNaN(value) && !isNaN(parseFloat(value));
};

export const validatePositiveNumber = (value) => {
  if (!value) return true;
  const num = parseFloat(value);
  return !isNaN(num) && num > 0;
};

export const validateDate = (dateString) => {
  if (!dateString) return true;
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

export const validateFutureDate = (dateString) => {
  if (!dateString) return true;
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date > today;
};

export const validatePastDate = (dateString) => {
  if (!dateString) return true;
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return date < today;
};

export const validateFileSize = (file, maxSizeMB) => {
  if (!file) return true;
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

export const validateFileType = (file, allowedTypes) => {
  if (!file || !allowedTypes) return true;
  return allowedTypes.includes(file.type);
};

// Função para validar múltiplos campos
export const validateForm = (formData, validationRules) => {
  const errors = {};
  
  Object.keys(validationRules).forEach(field => {
    const value = formData[field];
    const rules = validationRules[field];
    
    for (const rule of rules) {
      let isValid = true;
      let errorMessage = '';
      
      switch (rule.type) {
        case 'required':
          isValid = validateRequired(value);
          errorMessage = rule.message || 'Campo obrigatório';
          break;
        case 'email':
          isValid = validateEmail(value);
          errorMessage = rule.message || 'Email inválido';
          break;
        case 'cpf':
          isValid = validateCPF(value);
          errorMessage = rule.message || 'CPF inválido';
          break;
        case 'cnpj':
          isValid = validateCNPJ(value);
          errorMessage = rule.message || 'CNPJ inválido';
          break;
        case 'phone':
          isValid = validatePhone(value);
          errorMessage = rule.message || 'Telefone inválido';
          break;
        case 'minLength':
          isValid = validateMinLength(value, rule.value);
          errorMessage = rule.message || `Mínimo de ${rule.value} caracteres`;
          break;
        case 'maxLength':
          isValid = validateMaxLength(value, rule.value);
          errorMessage = rule.message || `Máximo de ${rule.value} caracteres`;
          break;
        case 'numeric':
          isValid = validateNumeric(value);
          errorMessage = rule.message || 'Deve ser um número';
          break;
        case 'positiveNumber':
          isValid = validatePositiveNumber(value);
          errorMessage = rule.message || 'Deve ser um número positivo';
          break;
        case 'date':
          isValid = validateDate(value);
          errorMessage = rule.message || 'Data inválida';
          break;
        case 'futureDate':
          isValid = validateFutureDate(value);
          errorMessage = rule.message || 'Data deve ser futura';
          break;
        case 'pastDate':
          isValid = validatePastDate(value);
          errorMessage = rule.message || 'Data deve ser passada';
          break;
        default:
          break;
      }
      
      if (!isValid) {
        errors[field] = errorMessage;
        break; // Para na primeira validação que falhar
      }
    }
  });
  
  return errors;
};

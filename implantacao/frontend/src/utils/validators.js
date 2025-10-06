/**
 * Utilitários de validação
 * Centraliza funções de validação reutilizáveis
 */

/**
 * Validar email
 * @param {string} email - Email para validar
 * @returns {boolean} Email válido
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Validar CPF
 * @param {string} cpf - CPF para validar
 * @returns {boolean} CPF válido
 */
export const isValidCPF = (cpf) => {
  if (!cpf || typeof cpf !== 'string') return false;
  
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length !== 11) return false;
  
  // Verificar se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleaned)) return false;
  
  // Validar dígitos verificadores
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned.charAt(10))) return false;
  
  return true;
};

/**
 * Validar CNPJ
 * @param {string} cnpj - CNPJ para validar
 * @returns {boolean} CNPJ válido
 */
export const isValidCNPJ = (cnpj) => {
  if (!cnpj || typeof cnpj !== 'string') return false;
  
  const cleaned = cnpj.replace(/\D/g, '');
  if (cleaned.length !== 14) return false;
  
  // Verificar se todos os dígitos são iguais
  if (/^(\d)\1{13}$/.test(cleaned)) return false;
  
  // Validar primeiro dígito verificador
  let sum = 0;
  let weight = 2;
  for (let i = 11; i >= 0; i--) {
    sum += parseInt(cleaned.charAt(i)) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  let remainder = sum % 11;
  const firstDigit = remainder < 2 ? 0 : 11 - remainder;
  if (firstDigit !== parseInt(cleaned.charAt(12))) return false;
  
  // Validar segundo dígito verificador
  sum = 0;
  weight = 2;
  for (let i = 12; i >= 0; i--) {
    sum += parseInt(cleaned.charAt(i)) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  remainder = sum % 11;
  const secondDigit = remainder < 2 ? 0 : 11 - remainder;
  if (secondDigit !== parseInt(cleaned.charAt(13))) return false;
  
  return true;
};

/**
 * Validar telefone
 * @param {string} phone - Telefone para validar
 * @returns {boolean} Telefone válido
 */
export const isValidPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 10 || cleaned.length === 11;
};

/**
 * Validar senha
 * @param {string} password - Senha para validar
 * @param {object} options - Opções de validação
 * @returns {object} Resultado da validação
 */
export const validatePassword = (password, options = {}) => {
  const {
    minLength = 6,
    requireUppercase = false,
    requireLowercase = false,
    requireNumbers = false,
    requireSpecialChars = false
  } = options;
  
  const result = {
    isValid: true,
    errors: []
  };
  
  if (!password || typeof password !== 'string') {
    result.isValid = false;
    result.errors.push('Senha é obrigatória');
    return result;
  }
  
  if (password.length < minLength) {
    result.isValid = false;
    result.errors.push(`Senha deve ter pelo menos ${minLength} caracteres`);
  }
  
  if (requireUppercase && !/[A-Z]/.test(password)) {
    result.isValid = false;
    result.errors.push('Senha deve conter pelo menos uma letra maiúscula');
  }
  
  if (requireLowercase && !/[a-z]/.test(password)) {
    result.isValid = false;
    result.errors.push('Senha deve conter pelo menos uma letra minúscula');
  }
  
  if (requireNumbers && !/\d/.test(password)) {
    result.isValid = false;
    result.errors.push('Senha deve conter pelo menos um número');
  }
  
  if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    result.isValid = false;
    result.errors.push('Senha deve conter pelo menos um caractere especial');
  }
  
  return result;
};

/**
 * Validar data
 * @param {string|Date} date - Data para validar
 * @returns {boolean} Data válida
 */
export const isValidDate = (date) => {
  if (!date) return false;
  
  try {
    const dateObj = new Date(date);
    return !isNaN(dateObj.getTime());
  } catch (error) {
    return false;
  }
};

/**
 * Validar URL
 * @param {string} url - URL para validar
 * @returns {boolean} URL válida
 */
export const isValidURL = (url) => {
  if (!url || typeof url !== 'string') return false;
  
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Validar número
 * @param {any} value - Valor para validar
 * @param {object} options - Opções de validação
 * @returns {boolean} Número válido
 */
export const isValidNumber = (value, options = {}) => {
  const { min, max, integer = false } = options;
  
  if (value === null || value === undefined || value === '') return false;
  
  const num = Number(value);
  if (isNaN(num)) return false;
  
  if (integer && !Number.isInteger(num)) return false;
  
  if (min !== undefined && num < min) return false;
  
  if (max !== undefined && num > max) return false;
  
  return true;
};

/**
 * Validar string não vazia
 * @param {any} value - Valor para validar
 * @param {number} minLength - Tamanho mínimo
 * @param {number} maxLength - Tamanho máximo
 * @returns {boolean} String válida
 */
export const isValidString = (value, minLength = 1, maxLength = Infinity) => {
  if (!value || typeof value !== 'string') return false;
  
  const trimmed = value.trim();
  return trimmed.length >= minLength && trimmed.length <= maxLength;
};

/**
 * Validar array não vazio
 * @param {any} value - Valor para validar
 * @param {number} minLength - Tamanho mínimo
 * @returns {boolean} Array válido
 */
export const isValidArray = (value, minLength = 1) => {
  return Array.isArray(value) && value.length >= minLength;
};

/**
 * Validar objeto não vazio
 * @param {any} value - Valor para validar
 * @returns {boolean} Objeto válido
 */
export const isValidObject = (value) => {
  return value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length > 0;
};

/**
 * Validar per capita (peso em kg)
 * @param {any} value - Valor para validar
 * @returns {boolean} Per capita válido
 */
export const isValidPerCapita = (value) => {
  if (!isValidNumber(value, { min: 0, max: 999.999 })) return false;
  
  const num = Number(value);
  return num >= 0 && num <= 999.999;
};

/**
 * Validar tipo de acesso
 * @param {string} tipo - Tipo de acesso para validar
 * @returns {boolean} Tipo válido
 */
export const isValidTipoAcesso = (tipo) => {
  const tiposValidos = [
    'administrador',
    'coordenador',
    'administrativo',
    'gerente',
    'supervisor',
    'nutricionista'
  ];
  
  return tiposValidos.includes(tipo);
};

/**
 * Validar nível de acesso
 * @param {string} nivel - Nível de acesso para validar
 * @returns {boolean} Nível válido
 */
export const isValidNivelAcesso = (nivel) => {
  const niveisValidos = ['I', 'II', 'III'];
  return niveisValidos.includes(nivel);
};

/**
 * Validar status
 * @param {string} status - Status para validar
 * @returns {boolean} Status válido
 */
export const isValidStatus = (status) => {
  const statusValidos = ['ativo', 'inativo', 'bloqueado'];
  return statusValidos.includes(status);
};

/**
 * Validar tipo de recebimento
 * @param {string} tipo - Tipo de recebimento para validar
 * @returns {boolean} Tipo válido
 */
export const isValidTipoRecebimento = (tipo) => {
  const tiposValidos = ['Completo', 'Parcial'];
  return tiposValidos.includes(tipo);
};

/**
 * Validar tipo de entrega
 * @param {string} tipo - Tipo de entrega para validar
 * @returns {boolean} Tipo válido
 */
export const isValidTipoEntrega = (tipo) => {
  const tiposValidos = ['HORTI', 'PAO', 'PERECIVEL', 'BASE SECA', 'LIMPEZA'];
  return tiposValidos.includes(tipo);
};

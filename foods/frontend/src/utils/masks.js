/**
 * Utilitários para aplicação de máscaras em campos de entrada
 */

/**
 * Remove todos os caracteres não numéricos de uma string
 * @param {string} value - Valor a ser limpo
 * @returns {string} - String contendo apenas números
 */
export const removeNonNumeric = (value) => {
  return value.replace(/\D/g, '');
};

/**
 * Aplica máscara de CEP (#####-###)
 * @param {string} value - Valor a ser formatado
 * @returns {string} - Valor formatado
 */
export const maskCEP = (value) => {
  const numbers = removeNonNumeric(value);
  if (numbers.length <= 5) {
    return numbers;
  }
  return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
};

/**
 * Aplica máscara de CPF (###.###.###-##)
 * @param {string} value - Valor a ser formatado
 * @returns {string} - Valor formatado
 */
export const maskCPF = (value) => {
  const numbers = removeNonNumeric(value);
  if (numbers.length <= 3) {
    return numbers;
  } else if (numbers.length <= 6) {
    return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  } else if (numbers.length <= 9) {
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  } else {
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
  }
};

/**
 * Aplica máscara de CNPJ (##.###.###/####-##)
 * @param {string} value - Valor a ser formatado
 * @returns {string} - Valor formatado
 */
export const maskCNPJ = (value) => {
  const numbers = removeNonNumeric(value);
  if (numbers.length <= 2) {
    return numbers;
  } else if (numbers.length <= 5) {
    return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
  } else if (numbers.length <= 8) {
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
  } else if (numbers.length <= 12) {
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`;
  } else {
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`;
  }
};

/**
 * Aplica máscara de telefone (## ####-#### para fixo ou ## #####-#### para celular)
 * @param {string} value - Valor a ser formatado
 * @returns {string} - Valor formatado
 */
export const maskTelefone = (value) => {
  const numbers = removeNonNumeric(value);
  
  // Remove o código do país se presente (assume que começa com 55)
  let cleanNumbers = numbers;
  if (numbers.startsWith('55') && numbers.length > 10) {
    cleanNumbers = numbers.slice(2);
  }
  
  if (cleanNumbers.length <= 2) {
    return cleanNumbers;
  } else if (cleanNumbers.length <= 6) {
    return `${cleanNumbers.slice(0, 2)} ${cleanNumbers.slice(2)}`;
  } else if (cleanNumbers.length <= 10) {
    // Telefone fixo (10 dígitos)
    return `${cleanNumbers.slice(0, 2)} ${cleanNumbers.slice(2, 6)}-${cleanNumbers.slice(6)}`;
  } else {
    // Celular (11 dígitos)
    return `${cleanNumbers.slice(0, 2)} ${cleanNumbers.slice(2, 7)}-${cleanNumbers.slice(7)}`;
  }
};

/**
 * Aplica a máscara apropriada baseada no tipo de campo
 * @param {string} value - Valor a ser formatado
 * @param {string} maskType - Tipo de máscara ('cep', 'cpf', 'cnpj', 'telefone')
 * @returns {string} - Valor formatado
 */
export const applyMask = (value, maskType) => {
  if (!value || value === '') return '';
  
  switch (maskType) {
    case 'cep':
      return maskCEP(value);
    case 'cpf':
      return maskCPF(value);
    case 'cnpj':
      return maskCNPJ(value);
    case 'telefone':
      return maskTelefone(value);
    default:
      return value;
  }
};

/**
 * Remove a máscara e retorna apenas os números
 * @param {string} value - Valor com máscara
 * @param {string} maskType - Tipo de máscara
 * @returns {string} - Valor sem máscara (apenas números)
 */
export const removeMask = (value, maskType) => {
  if (!value) return '';
  return removeNonNumeric(value);
};

/**
 * Valida se o valor está completo baseado no tipo de máscara
 * @param {string} value - Valor a ser validado
 * @param {string} maskType - Tipo de máscara
 * @returns {boolean} - True se o valor está completo
 */
export const isMaskComplete = (value, maskType) => {
  const numbers = removeNonNumeric(value);
  
  switch (maskType) {
    case 'cep':
      return numbers.length === 8;
    case 'cpf':
      return numbers.length === 11;
    case 'cnpj':
      return numbers.length === 14;
    case 'telefone':
      return numbers.length === 10 || numbers.length === 11;
    default:
      return true;
  }
};

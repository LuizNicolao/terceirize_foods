/**
 * Gera uma senha aleatória com critérios de segurança
 * @param {number} length - Comprimento da senha (padrão: 12)
 * @param {boolean} includeUppercase - Incluir letras maiúsculas (padrão: true)
 * @param {boolean} includeLowercase - Incluir letras minúsculas (padrão: true)
 * @param {boolean} includeNumbers - Incluir números (padrão: true)
 * @param {boolean} includeSymbols - Incluir símbolos (padrão: true)
 * @returns {string} Senha gerada
 */
const generatePassword = (length = 12, options = {}) => {
  const {
    includeUppercase = true,
    includeLowercase = true,
    includeNumbers = true,
    includeSymbols = true
  } = options;

  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  let chars = '';
  let password = '';

  // Adicionar caracteres baseado nas opções
  if (includeUppercase) chars += uppercase;
  if (includeLowercase) chars += lowercase;
  if (includeNumbers) chars += numbers;
  if (includeSymbols) chars += symbols;

  // Garantir pelo menos um caractere de cada tipo selecionado
  if (includeUppercase) password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
  if (includeLowercase) password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
  if (includeNumbers) password += numbers.charAt(Math.floor(Math.random() * numbers.length));
  if (includeSymbols) password += symbols.charAt(Math.floor(Math.random() * symbols.length));

  // Completar o resto da senha
  for (let i = password.length; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  // Embaralhar a senha
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

/**
 * Gera uma senha padrão para novos usuários
 * @returns {string} Senha padrão
 */
const generateDefaultPassword = () => {
  return generatePassword(8, {
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: false
  });
};

/**
 * Gera uma senha forte para administradores
 * @returns {string} Senha forte
 */
const generateStrongPassword = () => {
  return generatePassword(16, {
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true
  });
};

/**
 * Valida se uma senha atende aos critérios de segurança
 * @param {string} password - Senha a ser validada
 * @returns {object} Resultado da validação
 */
const validatePassword = (password) => {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('Senha deve ter pelo menos 8 caracteres');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra maiúscula');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra minúscula');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Senha deve conter pelo menos um número');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
    errors.push('Senha deve conter pelo menos um símbolo');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  generatePassword,
  generateDefaultPassword,
  generateStrongPassword,
  validatePassword
};

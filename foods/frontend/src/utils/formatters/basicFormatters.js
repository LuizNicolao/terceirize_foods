/**
 * Formatações básicas para campos comuns
 */

/**
 * Formata código do produto (apenas letras, números, hífens e underscores)
 */
export const formatCodigo = (value) => {
  if (!value) return '';
  
  // Remove caracteres especiais exceto hífen e underscore
  const formatted = value.replace(/[^a-zA-Z0-9\-_]/g, '');
  
  // Converte para maiúsculas
  return formatted.toUpperCase();
};

/**
 * Formata nome (remove caracteres especiais, mantém acentos)
 */
export const formatNome = (value) => {
  if (!value) return '';
  
  // Remove caracteres especiais exceto espaços e acentos
  return value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
};

/**
 * Formata número decimal (fator de conversão, peso líquido)
 */
export const formatDecimal = (value, maxDecimals = 3) => {
  if (!value) return '';
  
  // Remove tudo exceto números e ponto
  let formatted = value.replace(/[^\d.]/g, '');
  
  // Garante apenas um ponto decimal
  const parts = formatted.split('.');
  if (parts.length > 2) {
    formatted = parts[0] + '.' + parts.slice(1).join('');
  }
  
  // Limita casas decimais
  if (parts.length === 2 && parts[1].length > maxDecimals) {
    formatted = parts[0] + '.' + parts[1].substring(0, maxDecimals);
  }
  
  return formatted;
};

/**
 * Formata referência de mercado (remove caracteres especiais)
 */
export const formatReferenciaMercado = (value) => {
  if (!value) return '';
  
  // Remove caracteres especiais exceto letras, números, espaços e alguns símbolos
  return value.replace(/[^a-zA-ZÀ-ÿ0-9\s\-_.,()]/g, '');
};

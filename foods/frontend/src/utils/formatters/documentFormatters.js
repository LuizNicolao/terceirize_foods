/**
 * Formatações específicas para documentos brasileiros
 */

/**
 * Formata CPF (000.000.000-00)
 */
export const formatCPF = (value) => {
  if (!value) return '';
  
  // Remove tudo exceto números
  const numbers = value.replace(/\D/g, '');
  
  // Aplica máscara
  return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

/**
 * Formata CNPJ (00.000.000/0000-00)
 */
export const formatCNPJ = (value) => {
  if (!value) return '';
  
  // Remove tudo exceto números
  const numbers = value.replace(/\D/g, '');
  
  // Aplica máscara
  return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
};

/**
 * Formata telefone ((00) 00000-0000)
 */
export const formatTelefone = (value) => {
  if (!value) return '';
  
  // Remove tudo exceto números
  const numbers = value.replace(/\D/g, '');
  
  // Aplica máscara baseada no tamanho
  if (numbers.length === 11) {
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (numbers.length === 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  return numbers;
};

/**
 * Formata CEP (00000-000)
 */
export const formatCEP = (value) => {
  if (!value) return '';
  
  // Remove tudo exceto números
  const numbers = value.replace(/\D/g, '');
  
  // Aplica máscara
  return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
};

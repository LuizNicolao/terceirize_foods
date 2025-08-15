/**
 * Formatações customizadas para campos específicos do sistema
 */

/**
 * Formata placa de veículo (ABC-1234 ou ABC1D23)
 */
export const formatPlaca = (value) => {
  if (!value) return '';
  
  // Remove caracteres especiais
  const cleaned = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  
  // Formato Mercosul (ABC1D23)
  if (cleaned.length === 7) {
    return cleaned.replace(/([A-Z]{3})(\d{1})([A-Z]{1})(\d{2})/, '$1$2$3$4');
  }
  
  // Formato antigo (ABC-1234)
  if (cleaned.length === 7) {
    return cleaned.replace(/([A-Z]{3})(\d{4})/, '$1-$2');
  }
  
  return cleaned;
};

/**
 * Formata CNH (00000000000)
 */
export const formatCNH = (value) => {
  if (!value) return '';
  
  // Remove tudo exceto números
  return value.replace(/\D/g, '');
};

/**
 * Formata matrícula (000000)
 */
export const formatMatricula = (value) => {
  if (!value) return '';
  
  // Remove tudo exceto números
  return value.replace(/\D/g, '');
};

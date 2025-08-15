/**
 * Formatações para datas e horários
 */

/**
 * Formata data (DD/MM/AAAA)
 */
export const formatDate = (value) => {
  if (!value) return '';
  
  // Remove tudo exceto números
  const numbers = value.replace(/\D/g, '');
  
  // Aplica máscara
  return numbers.replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3');
};

/**
 * Formata data e hora (DD/MM/AAAA HH:MM)
 */
export const formatDateTime = (value) => {
  if (!value) return '';
  
  // Remove tudo exceto números
  const numbers = value.replace(/\D/g, '');
  
  // Aplica máscara
  return numbers.replace(/(\d{2})(\d{2})(\d{4})(\d{2})(\d{2})/, '$1/$2/$3 $4:$5');
};

/**
 * Formata hora (HH:MM)
 */
export const formatTime = (value) => {
  if (!value) return '';
  
  // Remove tudo exceto números
  const numbers = value.replace(/\D/g, '');
  
  // Aplica máscara
  return numbers.replace(/(\d{2})(\d{2})/, '$1:$2');
};

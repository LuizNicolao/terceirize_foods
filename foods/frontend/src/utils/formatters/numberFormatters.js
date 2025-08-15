/**
 * Formatações para números e moeda
 */

/**
 * Formata moeda (R$ 0,00)
 */
export const formatCurrency = (value) => {
  if (!value) return '';
  
  // Remove tudo exceto números
  const numbers = value.replace(/\D/g, '');
  
  // Converte para centavos
  const cents = parseInt(numbers) || 0;
  const reais = cents / 100;
  
  // Formata como moeda brasileira
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(reais);
};

/**
 * Formata número com separadores (1.234,56)
 */
export const formatNumber = (value, decimals = 2) => {
  if (!value) return '';
  
  // Remove tudo exceto números e ponto
  const numbers = value.replace(/[^\d.]/g, '');
  
  // Converte para número
  const num = parseFloat(numbers) || 0;
  
  // Formata com separadores brasileiros
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num);
};

/**
 * Formata porcentagem (12,34%)
 */
export const formatPercentage = (value) => {
  if (!value) return '';
  
  // Remove tudo exceto números e ponto
  const numbers = value.replace(/[^\d.]/g, '');
  
  // Converte para número
  const num = parseFloat(numbers) || 0;
  
  // Formata como porcentagem
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num / 100);
};

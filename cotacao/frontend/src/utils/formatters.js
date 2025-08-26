// Formatação de moeda brasileira
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value || 0);
};

// Formatação de data brasileira
export const formatDate = (date) => {
  if (!date) return '';
  
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(date));
};

// Formatação de data e hora brasileira
export const formatDateTime = (date) => {
  if (!date) return '';
  
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
};

// Formatação de tempo relativo
export const formatRelativeTime = (date) => {
  if (!date) return '';
  
  const timeDiff = Math.floor((Date.now() - new Date(date)) / (1000 * 60 * 60));
  
  if (timeDiff < 1) {
    return 'Agora mesmo';
  } else if (timeDiff < 24) {
    return `${timeDiff} horas atrás`;
  } else {
    const days = Math.floor(timeDiff / 24);
    return `${days} dia${days > 1 ? 's' : ''} atrás`;
  }
};

/**
 * Formata uma data apenas com data (sem hora)
 * @param {string} dateString - Data em formato string
 * @returns {string} - Data formatada
 */
export const formatDateOnly = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

/**
 * Formata um número para percentual
 * @param {number} value - Valor a ser formatado
 * @param {number} decimals - Número de casas decimais (padrão: 2)
 * @returns {string} - Percentual formatado
 */
export const formatPercentage = (value, decimals = 2) => {
  if (!value && value !== 0) return '0%';
  return `${value.toFixed(decimals)}%`;
};

/**
 * Formata um número para formato brasileiro
 * @param {number} value - Valor a ser formatado
 * @param {number} decimals - Número de casas decimais (padrão: 2)
 * @returns {string} - Número formatado
 */
export const formatNumber = (value, decimals = 2) => {
  if (!value && value !== 0) return '0';
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
}; 
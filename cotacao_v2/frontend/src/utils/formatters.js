// Utilitários de formatação genéricos

export const formatDate = (dateString, options = {}) => {
  if (!dateString) return '-';
  
  const defaultOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };

  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', { ...defaultOptions, ...options });
};

export const formatCurrency = (value, currency = 'BRL') => {
  if (!value && value !== 0) return '-';
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency
  }).format(value);
};

export const formatNumber = (value, decimals = 2) => {
  if (!value && value !== 0) return '-';
  
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
};

export const formatPercentage = (value, decimals = 2) => {
  if (!value && value !== 0) return '-';
  
  return `${new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value)}%`;
};

export const formatPhone = (phone) => {
  if (!phone) return '-';
  
  // Remove tudo que não é número
  const numbers = phone.replace(/\D/g, '');
  
  // Formata baseado no tamanho
  if (numbers.length === 11) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  } else if (numbers.length === 10) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  }
  
  return phone;
};

export const formatCPF = (cpf) => {
  if (!cpf) return '-';
  
  const numbers = cpf.replace(/\D/g, '');
  
  if (numbers.length === 11) {
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9)}`;
  }
  
  return cpf;
};

export const formatCNPJ = (cnpj) => {
  if (!cnpj) return '-';
  
  const numbers = cnpj.replace(/\D/g, '');
  
  if (numbers.length === 14) {
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12)}`;
  }
  
  return cnpj;
};

export const truncateText = (text, maxLength = 50) => {
  if (!text) return '-';
  
  if (text.length <= maxLength) return text;
  
  return `${text.slice(0, maxLength)}...`;
};

export const capitalizeFirst = (text) => {
  if (!text) return '';
  
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}; 
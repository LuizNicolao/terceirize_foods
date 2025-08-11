// Formatação de valores monetários
export const formatCurrency = (value) => {
  if (value === null || value === undefined || value === '') return 'R$ 0,00';
  const numericValue = parseFloat(value);
  if (isNaN(numericValue) || numericValue === 0) return 'R$ 0,00';
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(numericValue);
};

// Formatação de datas
export const formatDate = (dateString) => {
  if (!dateString) return 'Data não informada';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Data inválida';
    }
    
    return date.toLocaleDateString('pt-BR');
  } catch (error) {
    return 'Data inválida';
  }
};

// Formatação de data e hora
export const formatDateTime = (dateString) => {
  if (!dateString) return 'Data não informada';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Data inválida';
    }
    
    return date.toLocaleString('pt-BR');
  } catch (error) {
    return 'Data inválida';
  }
};

// Formatação de status
export const getStatusConfig = (status) => {
  const statusConfigs = {
    'pendente': {
      label: 'Pendente',
      color: 'bg-yellow-100 text-yellow-800',
      icon: '⏳'
    },
    'em_analise': {
      label: 'Em Análise',
      color: 'bg-blue-100 text-blue-800',
      icon: '🔍'
    },
    'aguardando_aprovacao': {
      label: 'Aguardando Aprovação',
      color: 'bg-orange-100 text-orange-800',
      icon: '⏰'
    },
    'aprovada': {
      label: 'Aprovada',
      color: 'bg-green-100 text-green-800',
      icon: '✅'
    },
    'rejeitada': {
      label: 'Rejeitada',
      color: 'bg-red-100 text-red-800',
      icon: '❌'
    },
    'ativo': {
      label: 'Ativo',
      color: 'bg-green-100 text-green-800',
      icon: '✅'
    },
    'inativo': {
      label: 'Inativo',
      color: 'bg-red-100 text-red-800',
      icon: '❌'
    }
  };

  return statusConfigs[status] || {
    label: status || 'Desconhecido',
    color: 'bg-gray-100 text-gray-800',
    icon: '❓'
  };
};

// Formatação de status badge
export const getStatusBadge = (status) => {
  const config = getStatusConfig(status);
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </span>
  );
};

// Formatação de números
export const formatNumber = (value, decimals = 2) => {
  if (value === null || value === undefined || value === '') return '0';
  const numericValue = parseFloat(value);
  if (isNaN(numericValue)) return '0';
  
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(numericValue);
};

// Formatação de porcentagem
export const formatPercentage = (value) => {
  if (value === null || value === undefined || value === '') return '0%';
  const numericValue = parseFloat(value);
  if (isNaN(numericValue)) return '0%';
  
  return `${numericValue.toFixed(2)}%`;
};

// Formatação de CPF/CNPJ
export const formatDocument = (document) => {
  if (!document) return '';
  
  const cleanDocument = document.replace(/\D/g, '');
  
  if (cleanDocument.length === 11) {
    // CPF
    return cleanDocument.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  } else if (cleanDocument.length === 14) {
    // CNPJ
    return cleanDocument.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  
  return document;
};

// Formatação de telefone
export const formatPhone = (phone) => {
  if (!phone) return '';
  
  const cleanPhone = phone.replace(/\D/g, '');
  
  if (cleanPhone.length === 11) {
    return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (cleanPhone.length === 10) {
    return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  return phone;
};

// Formatação de CEP
export const formatCEP = (cep) => {
  if (!cep) return '';
  
  const cleanCEP = cep.replace(/\D/g, '');
  
  if (cleanCEP.length === 8) {
    return cleanCEP.replace(/(\d{5})(\d{3})/, '$1-$2');
  }
  
  return cep;
}; 
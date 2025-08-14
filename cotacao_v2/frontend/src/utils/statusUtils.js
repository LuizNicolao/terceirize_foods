import { colors } from '../design-system';

// Utilitários para gerenciar status, cores e labels

export const getStatusColor = (status, statusConfig) => {
  if (!statusConfig || !statusConfig[status]) {
    return colors.neutral.gray;
  }
  
  return statusConfig[status].color || colors.neutral.gray;
};

export const getStatusLabel = (status, statusConfig) => {
  if (!statusConfig || !statusConfig[status]) {
    return status;
  }
  
  return statusConfig[status].label || status;
};

export const getStatusIcon = (status, statusConfig) => {
  if (!statusConfig || !statusConfig[status]) {
    return null;
  }
  
  return statusConfig[status].icon || null;
};

// Configurações de status específicas para cotações
export const cotacaoStatusConfig = {
  pendente: {
    label: 'Pendente',
    color: colors.secondary.orange,
    icon: 'FaClock'
  },
  aguardando_aprovacao: {
    label: 'Aguardando Aprovação',
    color: colors.status.warning,
    icon: 'FaUserCheck'
  },
  aguardando_aprovacao_supervisor: {
    label: 'Aguardando Análise do Supervisor',
    color: '#9C27B0',
    icon: 'FaSearch'
  },
  em_analise: {
    label: 'Em Análise',
    color: '#9C27B0',
    icon: 'FaSearch'
  },
  aprovada: {
    label: 'Aprovada',
    color: colors.primary.green,
    icon: 'FaThumbsUp'
  },
  rejeitada: {
    label: 'Rejeitada',
    color: colors.status.error,
    icon: 'FaThumbsDown'
  },
  renegociacao: {
    label: 'Renegociação',
    color: '#FF5722',
    icon: 'FaExchangeAlt'
  }
};

// Configurações de status para usuários
export const userStatusConfig = {
  ativo: {
    label: 'Ativo',
    color: colors.primary.green,
    icon: 'FaCheckCircle'
  },
  inativo: {
    label: 'Inativo',
    color: colors.status.error,
    icon: 'FaTimesCircle'
  },
  pendente: {
    label: 'Pendente',
    color: colors.secondary.orange,
    icon: 'FaClock'
  }
};

// Configurações de status para produtos
export const produtoStatusConfig = {
  ativo: {
    label: 'Ativo',
    color: colors.primary.green,
    icon: 'FaCheckCircle'
  },
  inativo: {
    label: 'Inativo',
    color: colors.status.error,
    icon: 'FaTimesCircle'
  },
  em_analise: {
    label: 'Em Análise',
    color: colors.secondary.orange,
    icon: 'FaSearch'
  }
};

// Função genérica para obter configuração de status
export const getStatusConfig = (entityType) => {
  const configs = {
    cotacao: cotacaoStatusConfig,
    user: userStatusConfig,
    produto: produtoStatusConfig
  };
  
  return configs[entityType] || {};
};

// Função para filtrar por status
export const filterByStatus = (items, selectedStatus, statusField = 'status') => {
  if (selectedStatus === 'todas' || selectedStatus === 'all') {
    return items;
  }

  return items.filter(item => item[statusField] === selectedStatus);
};

// Função para contar status
export const countByStatus = (items, statusField = 'status') => {
  const counts = {};
  
  items.forEach(item => {
    const status = item[statusField];
    counts[status] = (counts[status] || 0) + 1;
  });
  
  return counts;
};

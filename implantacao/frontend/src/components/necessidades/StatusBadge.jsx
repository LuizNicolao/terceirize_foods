import React from 'react';

/**
 * Função para obter label de status padronizado (mesmo formato da tela de consulta-status-necessidade)
 */
const getStatusNecessidadeLabel = (status) => {
  const statusMap = {
    'NEC': 'NEC - Necessidade Criada',
    'NEC NUTRI': 'NEC NUTRI - Necessidade Ajustada pela Nutricionista',
    'CONF NUTRI': 'CONF NUTRI - Confirmada pela Nutricionista',
    'NEC COORD': 'NEC COORD - Necessidade Ajustada pela Coordenação',
    'CONF COORD': 'CONF COORD - Confirmada pela Coordenação',
    'NEC LOG': 'NEC LOG - Necessidade Logística',
    'CONF': 'CONF - Confirmada',
    'APROVADA': 'APROVADA - Aprovada',
    'REJEITADA': 'REJEITADA - Rejeitada',
    'EM_ANALISE': 'EM_ANALISE - Em Análise'
  };
  return statusMap[status] || status || 'Desconhecido';
};

const StatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'NEC':
        return {
          label: getStatusNecessidadeLabel(status),
          className: 'bg-blue-100 text-blue-800'
        };
      case 'NEC NUTRI':
        return {
          label: getStatusNecessidadeLabel(status),
          className: 'bg-blue-200 text-blue-900'
        };
      case 'CONF NUTRI':
        return {
          label: getStatusNecessidadeLabel(status),
          className: 'bg-green-200 text-green-900'
        };
      case 'NEC COORD':
        return {
          label: getStatusNecessidadeLabel(status),
          className: 'bg-orange-100 text-orange-800'
        };
      case 'CONF COORD':
        return {
          label: getStatusNecessidadeLabel(status),
          className: 'bg-green-300 text-green-900'
        };
      case 'NEC LOG':
        return {
          label: getStatusNecessidadeLabel(status),
          className: 'bg-purple-100 text-purple-800'
        };
      case 'CONF':
        return {
          label: getStatusNecessidadeLabel(status),
          className: 'bg-green-100 text-green-800'
        };
      case 'APROVADA':
        return {
          label: getStatusNecessidadeLabel(status),
          className: 'bg-green-100 text-green-800'
        };
      case 'REJEITADA':
        return {
          label: getStatusNecessidadeLabel(status),
          className: 'bg-red-100 text-red-800'
        };
      case 'EM_ANALISE':
        return {
          label: getStatusNecessidadeLabel(status),
          className: 'bg-yellow-100 text-yellow-800'
        };
      default:
        return {
          label: getStatusNecessidadeLabel(status),
          className: 'bg-gray-100 text-gray-800'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
};

export default StatusBadge;

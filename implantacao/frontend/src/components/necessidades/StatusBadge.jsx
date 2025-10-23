import React from 'react';

const StatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'NEC NUTRI':
        return {
          label: 'Criada pela Nutricionista',
          className: 'bg-blue-100 text-blue-800',
          icon: '📝'
        };
      case 'APROVADA':
        return {
          label: 'Aprovada',
          className: 'bg-green-100 text-green-800',
          icon: '✅'
        };
      case 'REJEITADA':
        return {
          label: 'Rejeitada',
          className: 'bg-red-100 text-red-800',
          icon: '❌'
        };
      case 'EM_ANALISE':
        return {
          label: 'Em Análise',
          className: 'bg-yellow-100 text-yellow-800',
          icon: '⏳'
        };
      default:
        return {
          label: status || 'Desconhecido',
          className: 'bg-gray-100 text-gray-800',
          icon: '❓'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </span>
  );
};

export default StatusBadge;

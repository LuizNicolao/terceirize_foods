import React from 'react';
import { FaCheck, FaTimes } from 'react-icons/fa';

export const getStatusBadge = (status) => {
  const statusConfig = {
    'em_analise': { text: 'Em Análise', variant: 'warning' },
    'aguardando_aprovacao_supervisor': { text: 'Aguardando Análise', variant: 'warning' },
    'aguardando_aprovacao': { text: 'Aguardando Aprovação', variant: 'secondary' },
    'aprovada': { text: 'Aprovada', variant: 'success' },
    'rejeitada': { text: 'Rejeitada', variant: 'destructive' },
    'renegociacao': { text: 'Em Renegociação', variant: 'warning' }
  };

  const config = statusConfig[status] || { text: status, variant: 'default' };

  const variantClasses = {
    'warning': 'bg-yellow-100 text-yellow-800',
    'secondary': 'bg-gray-100 text-gray-800',
    'success': 'bg-green-100 text-green-800',
    'destructive': 'bg-red-100 text-red-800',
    'default': 'bg-gray-100 text-gray-800'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[config.variant]}`}>
      {config.text}
    </span>
  );
};

export const getTipoBadge = (tipo) => {
  if (tipo === 'emergencial') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <FaTimes size={12} className="mr-1" />
        Emergencial
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
      <FaCheck size={12} className="mr-1" />
      Programada
    </span>
  );
};

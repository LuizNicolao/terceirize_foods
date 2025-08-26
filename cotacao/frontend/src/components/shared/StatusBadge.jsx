import React from 'react';
import { FaCheck, FaTimes, FaClock, FaExclamationTriangle } from 'react-icons/fa';

const StatusBadge = ({ status, size = 'sm' }) => {
  const statusConfig = {
    'em_analise': { 
      text: 'Em Análise', 
      variant: 'warning',
      icon: FaClock 
    },
    'aguardando_aprovacao_supervisor': { 
      text: 'Aguardando Análise', 
      variant: 'warning',
      icon: FaClock 
    },
    'aguardando_aprovacao': { 
      text: 'Aguardando Aprovação', 
      variant: 'secondary',
      icon: FaClock 
    },
    'aprovada': { 
      text: 'Aprovada', 
      variant: 'success',
      icon: FaCheck 
    },
    'rejeitada': { 
      text: 'Rejeitada', 
      variant: 'destructive',
      icon: FaTimes 
    },
    'renegociacao': { 
      text: 'Em Renegociação', 
      variant: 'warning',
      icon: FaExclamationTriangle 
    },
    'pendente': { 
      text: 'Pendente', 
      variant: 'warning',
      icon: FaClock 
    }
  };

  const config = statusConfig[status] || { 
    text: status, 
    variant: 'default',
    icon: FaClock 
  };

  const IconComponent = config.icon;

  const sizeClasses = {
    'xs': 'px-1.5 py-0.5 text-xs',
    'sm': 'px-2.5 py-0.5 text-xs',
    'md': 'px-3 py-1 text-sm',
    'lg': 'px-4 py-1.5 text-base'
  };

  const variantClasses = {
    'warning': 'bg-yellow-100 text-yellow-800',
    'secondary': 'bg-gray-100 text-gray-800',
    'success': 'bg-green-100 text-green-800',
    'destructive': 'bg-red-100 text-red-800',
    'default': 'bg-gray-100 text-gray-800'
  };

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${sizeClasses[size]} ${variantClasses[config.variant]}`}>
      <IconComponent size={size === 'xs' ? 10 : size === 'sm' ? 12 : 14} className="mr-1" />
      {config.text}
    </span>
  );
};

export default StatusBadge;

import React from 'react';
import { FaCheck, FaTimes } from 'react-icons/fa';

const TipoBadge = ({ tipo, size = 'sm' }) => {
  const sizeClasses = {
    'xs': 'px-1.5 py-0.5 text-xs',
    'sm': 'px-2.5 py-0.5 text-xs',
    'md': 'px-3 py-1 text-sm',
    'lg': 'px-4 py-1.5 text-base'
  };

  if (tipo === 'emergencial') {
    return (
      <span className={`inline-flex items-center rounded-full font-medium ${sizeClasses[size]} bg-red-100 text-red-800`}>
        <FaTimes size={size === 'xs' ? 10 : size === 'sm' ? 12 : 14} className="mr-1" />
        Emergencial
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${sizeClasses[size]} bg-gray-100 text-gray-800`}>
      <FaCheck size={size === 'xs' ? 10 : size === 'sm' ? 12 : 14} className="mr-1" />
      Programada
    </span>
  );
};

export default TipoBadge;

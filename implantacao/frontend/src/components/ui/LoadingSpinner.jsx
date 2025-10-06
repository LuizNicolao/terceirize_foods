import React from 'react';
import { FaSpinner } from 'react-icons/fa';

export const LoadingSpinner = ({ 
  size = 'md', 
  color = 'green', 
  text = 'Carregando...',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colorClasses = {
    green: 'text-green-600',
    white: 'text-white',
    gray: 'text-gray-600',
    blue: 'text-blue-600'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <FaSpinner 
        className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]} mr-2`} 
      />
      {text && <span className="text-sm text-gray-600">{text}</span>}
    </div>
  );
};

export default LoadingSpinner;

import React from 'react';
import { FaBox, FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaUsers, FaTruck, FaRoute, FaBuilding } from 'react-icons/fa';

const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color = 'blue',
  trend = null,
  onClick,
  className = '' 
}) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500'
  };

  // Função para determinar o ícone baseado no título
  const getDefaultIcon = (title) => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('produto')) return FaBox;
    if (titleLower.includes('ativo')) return FaCheckCircle;
    if (titleLower.includes('inativo')) return FaTimesCircle;
    if (titleLower.includes('estoque') || titleLower.includes('baixo')) return FaExclamationTriangle;
    if (titleLower.includes('usuário') || titleLower.includes('usuario')) return FaUsers;
    if (titleLower.includes('veículo') || titleLower.includes('veiculo')) return FaTruck;
    if (titleLower.includes('rota')) return FaRoute;
    if (titleLower.includes('filial') || titleLower.includes('unidade')) return FaBuilding;
    return FaBox; // ícone padrão
  };

  const cardClasses = `
    bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200 
    transition-all duration-300 hover:shadow-md hover:-translate-y-1
    ${onClick ? 'cursor-pointer' : ''}
    ${className}
  `;

  const iconClasses = `
    w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-lg sm:text-xl text-white
    ${colorClasses[color]}
  `;

  return (
    <div className={cardClasses} onClick={onClick}>
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className={iconClasses}>
          {Icon ? <Icon /> : React.createElement(getDefaultIcon(title))}
        </div>
        
        {trend && (
          <div className={`text-xs sm:text-sm font-medium ${
            trend > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend > 0 ? '+' : ''}{trend}%
          </div>
        )}
      </div>
      
      <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
        {value}
      </div>
      
      <div className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
        {title}
      </div>
      
      {subtitle && (
        <div className="text-xs text-gray-500">
          {subtitle}
        </div>
      )}
    </div>
  );
};

export default StatCard; 
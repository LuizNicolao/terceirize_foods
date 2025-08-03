import React from 'react';

const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color = 'bg-blue-500',
  trend = null,
  onClick,
  className = '' 
}) => {
  const cardClasses = `
    bg-white rounded-xl p-6 shadow-sm border border-gray-200 
    transition-all duration-300 hover:shadow-lg hover:-translate-y-1
    ${onClick ? 'cursor-pointer' : ''}
    ${className}
  `;

  const iconClasses = `
    w-12 h-12 rounded-xl flex items-center justify-center text-2xl text-white
    ${color}
  `;

  return (
    <div className={cardClasses} onClick={onClick}>
      <div className="flex items-center justify-between mb-4">
        <div className={iconClasses}>
          {Icon && <Icon />}
        </div>
        
        {trend && (
          <div className={`text-sm font-medium ${
            trend > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend > 0 ? '+' : ''}{trend}%
          </div>
        )}
      </div>
      
      <div className="text-3xl font-bold text-gray-900 mb-2">
        {value}
      </div>
      
      <div className="text-sm font-medium text-gray-600 mb-1">
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
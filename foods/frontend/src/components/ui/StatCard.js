import React from 'react';

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

  const cardClasses = `
    bg-white rounded-lg p-3 sm:p-4 md:p-6 shadow-sm border border-gray-200 
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
          {Icon && <Icon />}
        </div>
        
        {trend && (
          <div className={`text-xs sm:text-sm font-medium ${
            trend > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend > 0 ? '+' : ''}{trend}%
          </div>
        )}
      </div>
      
      <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
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
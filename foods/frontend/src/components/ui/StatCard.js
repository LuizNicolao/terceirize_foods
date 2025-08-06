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
    bg-white rounded-lg p-3 sm:p-4 lg:p-6 shadow-sm border border-gray-200 
    transition-all duration-300 hover:shadow-md hover:-translate-y-1
    min-w-[140px] min-h-[120px] sm:min-w-[160px] sm:min-h-[140px]
    ${onClick ? 'cursor-pointer' : ''}
    ${className}
  `;

  const iconClasses = `
    w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center text-sm sm:text-lg lg:text-xl text-white
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
      
      <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
        {value}
      </div>
      
      <div className="text-xs sm:text-sm lg:text-base font-medium text-gray-600 mb-1">
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
import React from 'react';

const ActivityCard = ({ 
  title, 
  subtitle, 
  time, 
  icon: Icon, 
  color = 'bg-blue-500',
  className = '' 
}) => {
  return (
    <div className={`flex items-start space-x-3 p-4 hover:bg-gray-50 rounded-lg transition-colors duration-200 ${className}`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm text-white flex-shrink-0 ${color}`}>
        {Icon && <Icon />}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900">
          {title}
        </div>
        {subtitle && (
          <div className="text-sm text-gray-600 mt-1">
            {subtitle}
          </div>
        )}
        {time && (
          <div className="text-xs text-gray-500 mt-1">
            {time}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityCard; 
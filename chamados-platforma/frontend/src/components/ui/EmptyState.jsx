import React from 'react';
import { FaBox, FaUser } from 'react-icons/fa';

const EmptyState = ({ 
  title, 
  description, 
  icon = 'default',
  showContainer = true,
  className = ''
}) => {
  const getIcon = () => {
    const iconMap = {
      'usuarios': FaUser,
      'chamados': FaBox,
      'permissoes': FaUser,
      'default': FaBox
    };

    const IconComponent = iconMap[icon] || iconMap.default;
    return <IconComponent className="mx-auto h-12 w-12 text-gray-400 mb-4" />;
  };

  const content = (
    <div className={`text-center ${className}`}>
      {getIcon()}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-500">{description}</p>
      )}
    </div>
  );

  if (showContainer) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        {content}
      </div>
    );
  }

  return content;
};

export default EmptyState;

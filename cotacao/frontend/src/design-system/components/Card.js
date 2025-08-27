import React from 'react';

const Card = ({ 
  children, 
  variant = 'base',
  hover = false,
  className = '',
  ...props 
}) => {
  const baseClasses = 'bg-white rounded-lg shadow-sm border border-gray-200 p-6';
  const variantClasses = variant === 'dashboard' ? 'bg-gradient-to-r from-blue-50 to-indigo-50' : '';
  const hoverClasses = hover ? 'hover:shadow-md hover:-translate-y-0.5 transition-all duration-300' : '';
  
  const classes = `${baseClasses} ${variantClasses} ${hoverClasses} ${className}`;
  
  return (
    <div
      className={classes}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card; 
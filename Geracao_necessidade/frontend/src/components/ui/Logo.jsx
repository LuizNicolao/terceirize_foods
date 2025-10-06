import React from 'react';

export const Logo = ({ 
  size = 'md', 
  showText = true, 
  className = '',
  textClassName = ''
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizeClasses[size]} bg-green-600 rounded-full flex items-center justify-center text-white font-bold`}>
        N
      </div>
      
      {showText && (
        <span className={`ml-2 font-bold text-green-600 ${textSizeClasses[size]} ${textClassName}`}>
          Necessidades
        </span>
      )}
    </div>
  );
};

export default Logo;

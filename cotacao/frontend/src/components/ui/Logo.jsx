import React, { useState } from 'react';

export const Logo = ({ 
  size = 'md', 
  showText = true, 
  className = '',
  textClassName = ''
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
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

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      {!imageError && (
        <img 
          src="./logo-small.png"
          alt="Cotação Logo" 
          className={`${sizeClasses[size]} object-contain ${!imageLoaded ? 'hidden' : ''}`}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      )}
      
      {imageError && (
        <div className={`${sizeClasses[size]} bg-green-600 rounded-full flex items-center justify-center text-white font-bold`}>
          C
        </div>
      )}
      
      {showText && (
        <span className={`ml-2 font-bold text-green-600 ${textSizeClasses[size]} ${textClassName}`}>
          Cotação
        </span>
      )}
    </div>
  );
};

export default Logo;

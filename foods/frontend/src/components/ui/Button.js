import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  loading = false,
  className = '',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500',
    success: 'bg-green-500 hover:bg-green-600 text-white focus:ring-green-400',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-white focus:ring-yellow-400',
    info: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
    outline: 'border-2 border-gray-300 hover:bg-gray-50 text-gray-700 focus:ring-gray-500',
    ghost: 'hover:bg-gray-100 text-gray-700 focus:ring-gray-500'
  };
  
  const sizes = {
    xs: 'px-2 py-1 text-xs min-h-[32px] min-w-[32px]',
    sm: 'px-2 py-1.5 text-xs sm:px-3 sm:py-1.5 sm:text-sm min-h-[36px] sm:min-h-[40px] min-w-[36px] sm:min-w-[40px]',
    md: 'px-3 py-2 text-xs sm:px-4 sm:py-2 sm:text-sm min-h-[40px] sm:min-h-[44px] min-w-[40px] sm:min-w-[44px]',
    lg: 'px-4 py-2.5 text-sm sm:px-6 sm:py-3 sm:text-base min-h-[44px] sm:min-h-[48px] min-w-[44px] sm:min-w-[48px]',
    xl: 'px-6 py-3 text-base sm:px-8 sm:py-4 sm:text-lg min-h-[48px] sm:min-h-[52px] min-w-[48px] sm:min-w-[52px]'
  };

  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <button 
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button; 
import React from 'react';
import { clsx } from 'clsx';

const Input = ({ 
  label,
  error,
  leftIcon,
  rightIcon,
  className = '',
  ...props 
}) => {
  const inputClasses = clsx(
    'block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors',
    {
      'border-error-300 focus:ring-error-500 focus:border-error-500': error,
      'border-neutral-300': !error,
      'pl-10': leftIcon,
      'pr-10': rightIcon
    },
    className
  );

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="text-neutral-400">
              {leftIcon}
            </div>
          </div>
        )}
        
        <input 
          className={inputClasses}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <div className="text-neutral-400">
              {rightIcon}
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-error-600">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;

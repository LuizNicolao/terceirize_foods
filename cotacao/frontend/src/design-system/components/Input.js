import React from 'react';

const Input = ({ 
  label, 
  error, 
  withIcon = false,
  className = '',
  ...props 
}) => {
  const baseClasses = 'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors';
  const errorClasses = error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : '';
  const iconClasses = withIcon ? 'pl-10' : '';
  
  const inputClasses = `${baseClasses} ${errorClasses} ${iconClasses} ${className}`;
  
  return (
    <div className="flex flex-col gap-2 mb-4">
      {label && (
        <label className="text-sm font-semibold text-gray-700">
          {label}
        </label>
      )}
      <input
        className={inputClasses}
        {...props}
      />
      {error && (
        <span className="text-sm text-red-600">
          {error}
        </span>
      )}
    </div>
  );
};

export default Input; 
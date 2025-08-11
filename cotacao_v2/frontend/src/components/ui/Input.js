import React from 'react';

const Input = ({ 
  label, 
  error, 
  type = 'text', 
  className = '', 
  disabled = false,
  children,
  ...props 
}) => {
  const baseClasses = 'w-full px-3 py-2 border rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const inputClasses = error 
    ? `${baseClasses} border-red-300 focus:border-red-500 focus:ring-red-500` 
    : `${baseClasses} border-gray-300 focus:border-green-500 focus:ring-green-500`;
  
  const finalClasses = `${inputClasses} ${className}`;
  
  if (type === 'select') {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <select 
          className={finalClasses}
          disabled={disabled}
          {...props}
        >
          {children}
        </select>
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
  
  if (type === 'textarea') {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <textarea 
          className={`${finalClasses} resize-vertical min-h-[80px]`}
          disabled={disabled}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
  
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input 
        type={type}
        className={finalClasses}
        disabled={disabled}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Input;

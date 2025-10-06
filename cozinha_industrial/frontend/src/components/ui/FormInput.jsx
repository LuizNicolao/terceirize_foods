import React from 'react';

export const FormInput = ({
  type = 'text',
  placeholder,
  icon,
  error,
  label,
  required = false,
  className = '',
  ...props
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        
        {type === 'textarea' ? (
          <textarea
            placeholder={placeholder}
            {...props}
            className={`
              w-full px-3 py-3 ${icon ? 'pl-10' : 'pl-3'} pr-3
              border-2 border-gray-200 rounded-lg
              text-gray-900 placeholder-gray-500
              focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none
              transition-all duration-300
              resize-vertical min-h-[80px]
              ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}
              ${className}
            `}
          />
        ) : (
          <input
            type={type}
            placeholder={placeholder}
            {...props}
            className={`
              w-full px-3 py-3 ${icon ? 'pl-10' : 'pl-3'} pr-3
              border-2 border-gray-200 rounded-lg
              text-gray-900 placeholder-gray-500
              focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none
              transition-all duration-300
              ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}
              ${className}
            `}
          />
        )}
      </div>
      
      {error && (
        <p className="text-sm text-red-600 mt-1">
          {error}
        </p>
      )}
    </div>
  );
};

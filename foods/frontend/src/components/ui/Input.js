import React from 'react';
import { useMask } from '../../hooks';

const Input = React.forwardRef(({ 
  label, 
  error, 
  type = 'text', 
  size = 'md',
  className = '',
  children,
  mask,
  ...props 
}, ref) => {
  // Hook para máscara se especificado
  const maskHook = mask ? useMask(mask, props.defaultValue || props.value || '') : null;
  
  const baseClasses = 'w-full border border-gray-300 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent';
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  };

  const inputClasses = `${baseClasses} ${sizes[size]} ${error ? 'border-red-500 focus:ring-red-500' : ''} ${className}`;

  const renderInput = () => {
    switch (type) {
      case 'select':
        return (
          <select ref={ref} className={inputClasses} {...props}>
            {children}
          </select>
        );
      case 'textarea':
        return (
          <textarea 
            ref={ref}
            className={`${inputClasses} resize-vertical min-h-[60px]`}
            rows={props.rows || 3}
            {...props}
          />
        );
      default:
        // Se há máscara, aplica o tratamento especial
        if (mask && maskHook) {
          const { maskedValue, handleChange } = maskHook;
          
          return (
            <input 
              ref={ref}
              type={type}
              className={inputClasses}
              value={maskedValue}
              onChange={(e) => handleChange(e, props.onChange)}
              {...props}
            />
          );
        }
        
        return (
          <input 
            ref={ref}
            type={type}
            className={inputClasses}
            {...props}
          />
        );
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      {renderInput()}
      {error && (
        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
});

export default Input; 
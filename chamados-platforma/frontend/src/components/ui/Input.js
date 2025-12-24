import React from 'react';

const Input = React.forwardRef(({ 
  label, 
  error, 
  type = 'text', 
  size = 'md',
  className = '',
  children,
  ...props 
}, ref) => {
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

  // Função para processar o label e renderizar asterisco em vermelho
  const renderLabel = () => {
    if (!label) return null;
    
    // Se o label for um React element, renderizar diretamente
    if (React.isValidElement(label)) {
      return label;
    }
    
    // Se o label for string, verificar se termina com asterisco
    const labelString = String(label);
    if (labelString.endsWith(' *')) {
      const textWithoutAsterisk = labelString.slice(0, -2);
      return (
        <>
          {textWithoutAsterisk} <span className="text-red-500">*</span>
        </>
      );
    }
    
    // Caso contrário, renderizar normalmente
    return label;
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {renderLabel()}
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
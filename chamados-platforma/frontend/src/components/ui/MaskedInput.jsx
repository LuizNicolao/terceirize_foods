import React from 'react';
import { useInputMask } from '../../hooks/common/useInputMask';

export const MaskedInput = ({
  maskType,
  label,
  error,
  size = 'md',
  className = '',
  onValueChange,
  initialValue = '',
  ...props
}) => {
  const maskProps = useInputMask(maskType);
  
  // Sincroniza o valor inicial
  React.useEffect(() => {
    if (initialValue && maskProps.value !== initialValue) {
      // Simula uma mudança para formatar o valor inicial
      const event = { target: { value: initialValue } };
      maskProps.onChange(event);
    }
  }, [initialValue]);

  // Notifica mudanças de valor para o componente pai
  React.useEffect(() => {
    if (onValueChange) {
      onValueChange(maskProps.value);
    }
  }, [maskProps.value, onValueChange]);

  const baseClasses = 'w-full border border-gray-300 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent';
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  };

  const inputClasses = `${baseClasses} ${sizes[size]} ${error ? 'border-red-500 focus:ring-red-500' : ''} ${className}`;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <input
        {...maskProps}
        {...props}
        className={inputClasses}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};

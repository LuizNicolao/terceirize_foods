import React from 'react';
import { useMaskedField } from '../../hooks/common/useMaskedField';

export const MaskedFormInput = ({
  maskType,
  register,
  fieldName,
  label,
  error,
  size = 'md',
  className = '',
  setValue,
  ...props
}) => {
  const maskProps = useMaskedField(maskType, register, fieldName, setValue);

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

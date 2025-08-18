import React, { forwardRef } from 'react';
import { useInputMask } from '../../hooks/useInputMask';

export const MaskedInput = forwardRef(({
  maskType,
  icon,
  error,
  className = '',
  ...props
}, ref) => {
  const maskHandlers = useInputMask(maskType);

  return (
    <div className="space-y-1">
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        
        <input
          ref={ref}
          {...props}
          {...maskHandlers}
          className={`
            w-full px-3 py-3 ${icon ? 'pl-10' : 'pl-3'} pr-3
            border-2 rounded-lg text-gray-900 placeholder-gray-500
            focus:ring-2 focus:ring-green-200 focus:outline-none
            transition-all duration-300
            ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-green-500'}
            ${className}
          `}
        />
      </div>
      
      {error && (
        <p className="text-sm text-red-600 mt-1">
          {error}
        </p>
      )}
    </div>
  );
});

MaskedInput.displayName = 'MaskedInput';

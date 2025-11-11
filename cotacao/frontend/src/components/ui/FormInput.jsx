import React from 'react';

const FormInput = ({
  type = 'text',
  placeholder,
  icon: Icon,
  error,
  className = '',
  label,
  children,
  ...props
}) => {
  const baseClasses = 'w-full px-3 py-3 border-2 border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:border-gray-500 focus:ring-2 focus:ring-gray-200 focus:outline-none transition-all duration-300';
  const errorClasses = error ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : '';
  const iconOffset = Icon ? 'pl-10 pr-3' : 'px-3';
  const classes = `${baseClasses} ${errorClasses} ${iconOffset} ${className}`;

  const renderInput = () => {
    if (type === 'select') {
      return (
        <select className={classes} {...props}>
          {children}
        </select>
      );
    }

    return (
      <input
        type={type}
        placeholder={placeholder}
        className={classes}
        {...props}
      />
    );
  };

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">{label}</label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Icon />
          </div>
        )}
        {renderInput()}
      </div>
      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
};

export default FormInput;


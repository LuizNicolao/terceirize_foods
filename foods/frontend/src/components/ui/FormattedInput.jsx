import React, { forwardRef, useState, useEffect } from 'react';
import { useFormatters } from '../../hooks/useFormatters';

const FormattedInput = forwardRef(({ 
  label, 
  error, 
  type = 'text',
  formatType = null,
  onFormat = null,
  onValidate = null,
  showError = true,
  size = 'md',
  className = '',
  children,
  ...props 
}, ref) => {
  const [localValue, setLocalValue] = useState(props.value || props.defaultValue || '');
  const [isFocused, setIsFocused] = useState(false);
  const { formatByType } = useFormatters();

  // Atualiza valor local quando props.value muda
  useEffect(() => {
    if (props.value !== undefined) {
      setLocalValue(props.value);
    }
  }, [props.value]);

  const baseClasses = 'w-full border border-gray-300 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent';
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  };

  const inputClasses = `${baseClasses} ${sizes[size]} ${error ? 'border-red-500 focus:ring-red-500' : ''} ${className}`;

  // Função de formatação baseada no tipo
  const formatValue = (value, formatType) => {
    if (!value) return '';
    
    if (formatType) {
      return formatByType(value, formatType, { maxDecimals: 3 });
    }
    
    return onFormat ? onFormat(value) : value;
  };

  // Handler para mudança de valor
  const handleChange = (e) => {
    const rawValue = e.target.value;
    let formattedValue = rawValue;

    // Aplica formatação se especificada
    if (formatType || onFormat) {
      formattedValue = formatValue(rawValue, formatType);
    }

    // Atualiza valor local
    setLocalValue(formattedValue);

    // Chama onChange original se existir
    if (props.onChange) {
      // Cria um evento sintético com o valor formatado
      const syntheticEvent = {
        ...e,
        target: {
          ...e.target,
          value: formattedValue
        }
      };
      props.onChange(syntheticEvent);
    }

    // Validação em tempo real
    if (onValidate) {
      onValidate(formattedValue);
    }
  };

  // Handler para foco
  const handleFocus = (e) => {
    setIsFocused(true);
    if (props.onFocus) {
      props.onFocus(e);
    }
  };

  // Handler para blur
  const handleBlur = (e) => {
    setIsFocused(false);
    if (props.onBlur) {
      props.onBlur(e);
    }
  };

  const renderInput = () => {
    const inputProps = {
      ...props,
      value: localValue,
      onChange: handleChange,
      onFocus: handleFocus,
      onBlur: handleBlur,
      className: inputClasses,
      ref: ref
    };

    switch (type) {
      case 'select':
        return (
          <select {...inputProps}>
            {children}
          </select>
        );
      case 'textarea':
        return (
          <textarea 
            {...inputProps}
            className={`${inputClasses} resize-vertical min-h-[60px]`}
            rows={props.rows || 3}
          />
        );
      default:
        return (
          <input 
            {...inputProps}
            type={type}
          />
        );
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {renderInput()}
      {error && showError && (
        <p className="mt-1 text-sm text-red-600 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      {/* Dica de formatação */}
      {isFocused && formatType && (
        <p className="mt-1 text-xs text-gray-500">
          {formatType === 'codigo' && 'Apenas letras, números, hífens e underscores'}
          {formatType === 'nome' && 'Apenas letras e espaços'}
          {formatType === 'decimal' && 'Número decimal com até 3 casas'}
          {formatType === 'referencia' && 'Texto com caracteres especiais limitados'}
          {formatType === 'cpf' && 'Formato: 000.000.000-00'}
          {formatType === 'cnpj' && 'Formato: 00.000.000/0000-00'}
          {formatType === 'telefone' && 'Formato: (00) 00000-0000'}
          {formatType === 'cep' && 'Formato: 00000-000'}
          {formatType === 'placa' && 'Formato: ABC-1234 ou ABC1D23'}
          {formatType === 'cnh' && 'Apenas números'}
          {formatType === 'matricula' && 'Apenas números'}
        </p>
      )}
    </div>
  );
});

FormattedInput.displayName = 'FormattedInput';

export default FormattedInput;

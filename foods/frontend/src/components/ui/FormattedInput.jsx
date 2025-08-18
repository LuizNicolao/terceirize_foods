import React from 'react';
import { useFormatters } from '../../hooks/useFormatters';

const FormattedInput = ({
  type = 'text',
  formatType, // 'cpf', 'cnpj', 'cep', 'phone'
  value,
  onChange,
  onBlur,
  className = '',
  placeholder,
  disabled = false,
  required = false,
  maxLength,
  ...props
}) => {
  const { handleFormatChange } = useFormatters();

  const handleChange = (e) => {
    if (formatType) {
      // Aplica formatação automática
      const formattedEvent = handleFormatChange(e, formatType, (formattedValue) => {
        // Chama o onChange original com o valor formatado
        if (onChange) {
          onChange({
            ...e,
            target: {
              ...e.target,
              value: formattedValue
            }
          });
        }
      });
    } else {
      // Sem formatação, chama o onChange original
      if (onChange) {
        onChange(e);
      }
    }
  };

  return (
    <input
      type={type}
      value={value}
      onChange={handleChange}
      onBlur={onBlur}
      className={`px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${className}`}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      maxLength={maxLength}
      {...props}
    />
  );
};

export default FormattedInput;

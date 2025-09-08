import { useState, useCallback } from 'react';

// Padrões de formatação
const MASKS = {
  cep: {
    pattern: /^(\d{5})(\d{3})$/,
    format: '$1-$2',
    maxLength: 9,
    placeholder: '00000-000'
  },
  cpf: {
    pattern: /^(\d{3})(\d{3})(\d{3})(\d{2})$/,
    format: '$1.$2.$3-$4',
    maxLength: 14,
    placeholder: '000.000.000-00'
  },
  cnpj: {
    pattern: /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    format: '$1.$2.$3/$4-$5',
    maxLength: 18,
    placeholder: '00.000.000/0000-00'
  },
  telefone: {
    pattern: /^(\d{2})(\d{4})(\d{4})$/,
    format: '$1 $2-$3',
    maxLength: 15,
    placeholder: '00 0000-0000'
  },
  celular: {
    pattern: /^(\d{2})(\d{5})(\d{4})$/,
    format: '$1 $2-$3',
    maxLength: 16,
    placeholder: '00 00000-0000'
  }
};

export const useInputMask = (maskType) => {
  const [value, setValue] = useState('');
  const mask = MASKS[maskType];

  const formatValue = useCallback((inputValue) => {
    if (!mask) return inputValue;

    // Remove tudo que não é número
    const numbers = inputValue.replace(/\D/g, '');
    
    // Aplica a formatação baseada no tipo de máscara
    if (maskType === 'telefone') {
      // Detecta se é celular (11 dígitos) ou fixo (10 dígitos)
      if (numbers.length === 11) {
        const celularMask = MASKS.celular;
        const match = numbers.match(celularMask.pattern);
        return match ? numbers.replace(celularMask.pattern, celularMask.format) : numbers;
      } else if (numbers.length === 10) {
        const match = numbers.match(mask.pattern);
        return match ? numbers.replace(mask.pattern, mask.format) : numbers;
      }
      return numbers;
    }

    // Para outros tipos de máscara
    const match = numbers.match(mask.pattern);
    return match ? numbers.replace(mask.pattern, mask.format) : numbers;
  }, [maskType, mask]);

  const handleChange = useCallback((e) => {
    const inputValue = e.target.value;
    const formattedValue = formatValue(inputValue);
    
    // Limita o tamanho baseado na máscara
    if (mask && formattedValue.length > mask.maxLength) {
      return;
    }
    
    setValue(formattedValue);
  }, [formatValue, mask]);

  const handleKeyPress = useCallback((e) => {
    // Permite apenas números e teclas de controle
    const isNumber = /[0-9]/.test(e.key);
    const isControlKey = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End'
    ].includes(e.key);

    if (!isNumber && !isControlKey) {
      e.preventDefault();
    }
  }, []);

  return {
    value,
    onChange: handleChange,
    onKeyPress: handleKeyPress,
    placeholder: mask?.placeholder || '',
    maxLength: mask?.maxLength
  };
};

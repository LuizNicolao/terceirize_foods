import { useCallback } from 'react';

// Padrões de formatação
const MASKS = {
  cep: {
    pattern: '#####-###',
    maxLength: 9,
    placeholder: '00000-000'
  },
  cpf: {
    pattern: '###.###.###-##',
    maxLength: 14,
    placeholder: '000.000.000-00'
  },
  cnpj: {
    pattern: '##.###.###/####-##',
    maxLength: 18,
    placeholder: '00.000.000/0000-00'
  },
  telefone: {
    pattern: '## ####-####',
    maxLength: 14,
    placeholder: '00 0000-0000'
  },
  celular: {
    pattern: '## #####-####',
    maxLength: 15,
    placeholder: '00 00000-0000'
  }
};

// Função para aplicar máscara
const applyMask = (value, maskPattern) => {
  if (!value) return '';
  
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '');
  
  let result = '';
  let numberIndex = 0;
  
  for (let i = 0; i < maskPattern.length && numberIndex < numbers.length; i++) {
    if (maskPattern[i] === '#') {
      result += numbers[numberIndex];
      numberIndex++;
    } else {
      result += maskPattern[i];
    }
  }
  
  return result;
};

// Função para detectar se é celular baseado no número de dígitos
const detectPhoneType = (value) => {
  const numbers = value.replace(/\D/g, '');
  return numbers.length === 11 ? 'celular' : 'telefone';
};

export const useInputMask = (maskType) => {
  const mask = MASKS[maskType];
  
  if (!mask) {
    console.warn(`Máscara "${maskType}" não encontrada`);
    return {
      onChange: () => {},
      onKeyPress: () => {},
      maxLength: undefined,
      placeholder: undefined
    };
  }

  const handleChange = useCallback((e) => {
    const input = e.target;
    let value = input.value;
    
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Para telefone, detecta se é celular ou fixo
    if (maskType === 'telefone') {
      const phoneType = detectPhoneType(numbers);
      const phoneMask = MASKS[phoneType];
      
      if (numbers.length <= phoneMask.maxLength) {
        value = applyMask(numbers, phoneMask.pattern);
        input.maxLength = phoneMask.maxLength;
      }
    } else {
      // Para outros tipos de máscara
      if (numbers.length <= mask.maxLength) {
        value = applyMask(numbers, mask.pattern);
      }
    }
    
    // Atualiza o valor do input
    input.value = value;
    
    // Dispara evento de change para react-hook-form
    const event = new Event('input', { bubbles: true });
    input.dispatchEvent(event);
  }, [maskType, mask]);

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
    onChange: handleChange,
    onKeyPress: handleKeyPress,
    maxLength: mask.maxLength,
    placeholder: mask.placeholder
  };
};

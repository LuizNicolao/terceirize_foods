import { useCallback } from 'react';
import { useInputMask } from './useInputMask';

export const useMaskedField = (maskType, register, fieldName) => {
  const maskProps = useInputMask(maskType);

  const handleChange = useCallback((e) => {
    // Chama a função de mudança da máscara
    maskProps.onChange(e);
    
    // Notifica o react-hook-form sobre a mudança
    if (register) {
      const { onChange } = register(fieldName);
      if (onChange) {
        // Passa o valor formatado para o react-hook-form
        const formattedEvent = {
          ...e,
          target: {
            ...e.target,
            value: maskProps.value
          }
        };
        onChange(formattedEvent);
      }
    }
  }, [maskProps, register, fieldName]);

  const handleKeyPress = useCallback((e) => {
    maskProps.onKeyPress(e);
  }, [maskProps]);

  return {
    value: maskProps.value,
    onChange: handleChange,
    onKeyPress: handleKeyPress,
    placeholder: maskProps.placeholder,
    maxLength: maskProps.maxLength
  };
};

import { useCallback, useEffect, useState } from 'react';
import { useInputMask } from './useInputMask';

export const useMaskedField = (maskType, register, fieldName, setValue) => {
  const maskProps = useInputMask(maskType);
  const [isInitialized, setIsInitialized] = useState(false);

  // Registra o campo no react-hook-form
  const registerProps = register ? register(fieldName) : {};

  const handleChange = useCallback((e) => {
    // Chama a função de mudança da máscara
    maskProps.onChange(e);
    
    // Notifica o react-hook-form sobre a mudança
    if (registerProps.onChange) {
      // Passa o valor formatado para o react-hook-form
      const formattedEvent = {
        ...e,
        target: {
          ...e.target,
          value: e.target.value // Usar o valor do evento, não o maskProps.value
        }
      };
      registerProps.onChange(formattedEvent);
    }
    
    // Também usar setValue se disponível
    if (setValue) {
      setValue(fieldName, e.target.value);
    }
  }, [maskProps, registerProps, fieldName, setValue]);

  const handleKeyPress = useCallback((e) => {
    maskProps.onKeyPress(e);
  }, [maskProps]);

  // Sincroniza com o valor inicial do react-hook-form
  useEffect(() => {
    if (registerProps.value && !isInitialized) {
      const event = { target: { value: registerProps.value } };
      maskProps.onChange(event);
      setIsInitialized(true);
    }
  }, [registerProps.value, isInitialized, maskProps]);

  return {
    value: maskProps.value,
    onChange: handleChange,
    onKeyPress: handleKeyPress,
    onBlur: registerProps.onBlur,
    name: registerProps.name,
    placeholder: maskProps.placeholder,
    maxLength: maskProps.maxLength
  };
};

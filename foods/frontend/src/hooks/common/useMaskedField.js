import { useCallback, useEffect, useState } from 'react';
import { useInputMask } from './useInputMask';

export const useMaskedField = (maskType, register, fieldName, setValue, watchValue) => {
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

  // Sincroniza com o valor do react-hook-form (inicial e mudanças)
  useEffect(() => {
    // Usar watchValue se disponível (passado como prop), senão usar registerProps.value
    const currentFormValue = watchValue !== undefined ? watchValue : registerProps.value;
    
    // Sempre sincronizar quando o valor do react-hook-form mudar
    if (currentFormValue !== undefined && currentFormValue !== null) {
      const currentValue = currentFormValue || '';
      const maskValue = maskProps.value || '';
      
      // Comparar valores sem considerar a máscara (remover hífen para comparação)
      const currentValueClean = String(currentValue).replace(/-/g, '').trim();
      const maskValueClean = String(maskValue).replace(/-/g, '').trim();
      
      if (currentValueClean !== maskValueClean && currentValueClean !== '') {
        // Valor mudou, atualizar
        const event = { target: { value: currentValue } };
        maskProps.onChange(event);
        setIsInitialized(true);
      }
    } else if ((currentFormValue === '' || currentFormValue === null) && maskProps.value !== '') {
      // Se o valor foi limpo, resetar também
      const event = { target: { value: '' } };
      maskProps.onChange(event);
      setIsInitialized(false);
    }
  }, [watchValue, registerProps.value, fieldName, maskProps]);

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

import { useState, useCallback } from 'react';
import { useInputMask } from './useInputMask';

export const useMaskedField = (maskType) => {
  const inputMask = useInputMask(maskType);
  const [value, setValue] = useState('');

  const handleChange = useCallback((event) => {
    inputMask.onChange(event);
    setValue(event.target.value);
  }, [inputMask]);

  return {
    value,
    onChange: handleChange,
    onKeyPress: inputMask.onKeyPress,
    placeholder: inputMask.placeholder,
    maxLength: inputMask.maxLength
  };
};


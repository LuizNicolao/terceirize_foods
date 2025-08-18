import { useState, useCallback } from 'react';
import { applyMask, removeMask } from '../utils/masks';

/**
 * Hook para gerenciar máscaras em campos de entrada
 * @param {string} maskType - Tipo de máscara ('cep', 'cpf', 'cnpj', 'telefone')
 * @param {string} initialValue - Valor inicial do campo
 * @returns {object} - Objeto com valor mascarado, função de mudança e valor limpo
 */
const useMask = (maskType, initialValue = '') => {
  const [maskedValue, setMaskedValue] = useState(() => {
    return initialValue ? applyMask(initialValue, maskType) : '';
  });

  const [cleanValue, setCleanValue] = useState(() => {
    return initialValue ? removeMask(initialValue, maskType) : '';
  });

  /**
   * Função para lidar com mudanças no campo
   * @param {Event} event - Evento de mudança do input
   * @param {Function} onChange - Função de callback opcional
   */
  const handleChange = useCallback((event, onChange) => {
    const inputValue = event.target.value;
    
    // Aplica a máscara ao valor digitado
    const newMaskedValue = applyMask(inputValue, maskType);
    
    // Remove a máscara para obter apenas os números
    const newCleanValue = removeMask(inputValue, maskType);
    
    // Atualiza os estados
    setMaskedValue(newMaskedValue);
    setCleanValue(newCleanValue);
    
    // Cria um novo evento com o valor mascarado
    const newEvent = {
      ...event,
      target: {
        ...event.target,
        value: newCleanValue // Envia o valor limpo para o React Hook Form
      }
    };
    
    // Chama a função de callback se fornecida
    if (onChange) {
      onChange(newEvent);
    }
  }, [maskType]);

  /**
   * Função para definir o valor programaticamente
   * @param {string} value - Valor a ser definido
   */
  const setValue = useCallback((value) => {
    const newMaskedValue = applyMask(value, maskType);
    const newCleanValue = removeMask(value, maskType);
    
    setMaskedValue(newMaskedValue);
    setCleanValue(newCleanValue);
  }, [maskType]);

  /**
   * Função para limpar o campo
   */
  const clear = useCallback(() => {
    setMaskedValue('');
    setCleanValue('');
  }, []);

  return {
    maskedValue,
    cleanValue,
    handleChange,
    setValue,
    clear
  };
};

export default useMask;

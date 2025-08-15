import { useCallback } from 'react';

/**
 * Hook para formatação de campos durante a digitação
 */
export const useFormatters = () => {
  
  /**
   * Formata código do produto (apenas letras, números, hífens e underscores)
   */
  const formatCodigo = useCallback((value) => {
    if (!value) return '';
    
    // Remove caracteres especiais exceto hífen e underscore
    const formatted = value.replace(/[^a-zA-Z0-9\-_]/g, '');
    
    // Converte para maiúsculas
    return formatted.toUpperCase();
  }, []);

  /**
   * Formata nome (remove caracteres especiais, mantém acentos)
   */
  const formatNome = useCallback((value) => {
    if (!value) return '';
    
    // Remove caracteres especiais exceto espaços e acentos
    return value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
  }, []);

  /**
   * Formata número decimal (fator de conversão, peso líquido)
   */
  const formatDecimal = useCallback((value, maxDecimals = 3) => {
    if (!value) return '';
    
    // Remove tudo exceto números e ponto
    let formatted = value.replace(/[^\d.]/g, '');
    
    // Garante apenas um ponto decimal
    const parts = formatted.split('.');
    if (parts.length > 2) {
      formatted = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Limita casas decimais
    if (parts.length === 2 && parts[1].length > maxDecimals) {
      formatted = parts[0] + '.' + parts[1].substring(0, maxDecimals);
    }
    
    return formatted;
  }, []);

  /**
   * Formata referência de mercado (remove caracteres especiais)
   */
  const formatReferenciaMercado = useCallback((value) => {
    if (!value) return '';
    
    // Remove caracteres especiais exceto letras, números, espaços e alguns símbolos
    return value.replace(/[^a-zA-ZÀ-ÿ0-9\s\-_.,()]/g, '');
  }, []);

  /**
   * Valida se o valor está dentro do range permitido
   */
  const validateRange = useCallback((value, min, max) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return false;
    return numValue >= min && numValue <= max;
  }, []);

  /**
   * Valida se o código está no formato correto
   */
  const validateCodigo = useCallback((value) => {
    if (!value) return false;
    return /^[a-zA-Z0-9\-_]+$/.test(value) && value.length >= 1 && value.length <= 20;
  }, []);

  /**
   * Valida se o nome está no formato correto
   */
  const validateNome = useCallback((value) => {
    if (!value) return false;
    return value.length >= 3 && value.length <= 200;
  }, []);

  /**
   * Valida se o decimal está no formato correto
   */
  const validateDecimal = useCallback((value, min = 0.001, max = 999999.999) => {
    if (!value) return true; // Campo opcional
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return false;
    return numValue >= min && numValue <= max;
  }, []);

  /**
   * Valida se a referência de mercado está no formato correto
   */
  const validateReferenciaMercado = useCallback((value) => {
    if (!value) return true; // Campo opcional
    return value.length >= 1 && value.length <= 200;
  }, []);

  return {
    formatCodigo,
    formatNome,
    formatDecimal,
    formatReferenciaMercado,
    validateCodigo,
    validateNome,
    validateDecimal,
    validateReferenciaMercado,
    validateRange
  };
};

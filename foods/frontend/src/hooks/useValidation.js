import { useState, useCallback } from 'react';

/**
 * Hook para validação em tempo real dos campos
 */
export const useValidation = () => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  /**
   * Marca um campo como tocado
   */
  const markAsTouched = useCallback((fieldName) => {
    setTouched(prev => ({
      ...prev,
      [fieldName]: true
    }));
  }, []);

  /**
   * Valida um campo específico
   */
  const validateField = useCallback((fieldName, value, validations) => {
    const fieldErrors = [];

    // Validações obrigatórias
    if (validations.required && (!value || value.trim() === '')) {
      fieldErrors.push(validations.required);
    }

    // Validações de comprimento mínimo
    if (validations.minLength && value && value.length < validations.minLength.value) {
      fieldErrors.push(validations.minLength.message);
    }

    // Validações de comprimento máximo
    if (validations.maxLength && value && value.length > validations.maxLength.value) {
      fieldErrors.push(validations.maxLength.message);
    }

    // Validações de padrão (regex)
    if (validations.pattern && value && !validations.pattern.value.test(value)) {
      fieldErrors.push(validations.pattern.message);
    }

    // Validações de valor mínimo
    if (validations.min && value && parseFloat(value) < validations.min.value) {
      fieldErrors.push(validations.min.message);
    }

    // Validações de valor máximo
    if (validations.max && value && parseFloat(value) > validations.max.value) {
      fieldErrors.push(validations.max.message);
    }

    // Validações customizadas
    if (validations.validate) {
      const customValidation = validations.validate(value);
      if (customValidation !== true) {
        fieldErrors.push(customValidation);
      }
    }

    // Atualiza erros
    setErrors(prev => ({
      ...prev,
      [fieldName]: fieldErrors.length > 0 ? fieldErrors[0] : null
    }));

    return fieldErrors.length === 0;
  }, []);

  /**
   * Valida todos os campos de uma vez
   */
  const validateAll = useCallback((formData, validations) => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validations).forEach(fieldName => {
      const value = formData[fieldName];
      const fieldValidations = validations[fieldName];
      
      const fieldErrors = [];

      // Aplica as mesmas validações do validateField
      if (fieldValidations.required && (!value || value.trim() === '')) {
        fieldErrors.push(fieldValidations.required);
      }

      if (fieldValidations.minLength && value && value.length < fieldValidations.minLength.value) {
        fieldErrors.push(fieldValidations.minLength.message);
      }

      if (fieldValidations.maxLength && value && value.length > fieldValidations.maxLength.value) {
        fieldErrors.push(fieldValidations.maxLength.message);
      }

      if (fieldValidations.pattern && value && !fieldValidations.pattern.value.test(value)) {
        fieldErrors.push(fieldValidations.pattern.message);
      }

      if (fieldValidations.min && value && parseFloat(value) < fieldValidations.min.value) {
        fieldErrors.push(fieldValidations.min.message);
      }

      if (fieldValidations.max && value && parseFloat(value) > fieldValidations.max.value) {
        fieldErrors.push(fieldValidations.max.message);
      }

      if (fieldValidations.validate) {
        const customValidation = fieldValidations.validate(value);
        if (customValidation !== true) {
          fieldErrors.push(customValidation);
        }
      }

      if (fieldErrors.length > 0) {
        newErrors[fieldName] = fieldErrors[0];
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, []);

  /**
   * Limpa erros de um campo específico
   */
  const clearFieldError = useCallback((fieldName) => {
    setErrors(prev => ({
      ...prev,
      [fieldName]: null
    }));
  }, []);

  /**
   * Limpa todos os erros
   */
  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  /**
   * Verifica se há erros
   */
  const hasErrors = useCallback(() => {
    return Object.keys(errors).some(key => errors[key] !== null);
  }, [errors]);

  /**
   * Verifica se um campo específico tem erro
   */
  const hasFieldError = useCallback((fieldName) => {
    return errors[fieldName] !== null && errors[fieldName] !== undefined;
  }, [errors]);

  /**
   * Verifica se um campo foi tocado
   */
  const isFieldTouched = useCallback((fieldName) => {
    return touched[fieldName] === true;
  }, [touched]);

  return {
    errors,
    touched,
    markAsTouched,
    validateField,
    validateAll,
    clearFieldError,
    clearAllErrors,
    hasErrors,
    hasFieldError,
    isFieldTouched
  };
};

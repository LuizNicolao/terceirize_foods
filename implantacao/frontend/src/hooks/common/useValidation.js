/**
 * Hook Universal de Validação
 * Gerencia erros de validação de forma reutilizável em todas as telas
 */

import { useState } from 'react';

export const useValidation = () => {
  const [validationErrors, setValidationErrors] = useState(null);
  const [showValidationModal, setShowValidationModal] = useState(false);

  /**
   * Processa resposta da API e verifica se há erros de validação
   * @param {Object} response - Resposta da API
   * @returns {boolean} - true se há erros de validação, false caso contrário
   */
  const handleApiResponse = (response) => {
    if (response.validationErrors || response.errorCategories) {
      setValidationErrors({
        errors: response.validationErrors,
        errorCategories: response.errorCategories
      });
      setShowValidationModal(true);
      return true; // Indica que há erros de validação
    }
    return false; // Não há erros de validação
  };

  /**
   * Fecha o modal de validação e limpa os erros
   */
  const handleCloseValidationModal = () => {
    setShowValidationModal(false);
    setValidationErrors(null);
  };

  /**
   * Limpa os erros de validação manualmente
   */
  const clearValidationErrors = () => {
    setValidationErrors(null);
    setShowValidationModal(false);
  };

  return {
    validationErrors,
    showValidationModal,
    handleApiResponse,
    handleCloseValidationModal,
    clearValidationErrors
  };
};

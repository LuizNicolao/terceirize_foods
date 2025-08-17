import { useState } from 'react';
import toast from 'react-hot-toast';

/**
 * Hook universal para gerenciar validação de erros
 * Pode ser usado em qualquer tela de cadastro
 */
export const useValidation = () => {
  const [validationErrors, setValidationErrors] = useState(null);
  const [showValidationModal, setShowValidationModal] = useState(false);

  /**
   * Processa resposta do backend e verifica se há erros de validação
   */
  const handleValidationResponse = (response) => {
    // Verificar se a resposta contém erros de validação
    if (response.validationErrors || response.errorCategories) {
      setValidationErrors({
        errors: response.validationErrors,
        errorCategories: response.errorCategories
      });
      setShowValidationModal(true);
      return true; // Indica que há erros de validação
    }
    
    // Se não há erros de validação, mas há erro geral
    if (!response.success && response.error) {
      toast.error(response.error);
      return false;
    }
    
    return false; // Não há erros
  };

  /**
   * Fecha o modal de validação
   */
  const closeValidationModal = () => {
    setShowValidationModal(false);
    setValidationErrors(null);
  };

  /**
   * Limpa todos os erros de validação
   */
  const clearValidationErrors = () => {
    setValidationErrors(null);
    setShowValidationModal(false);
  };

  return {
    validationErrors,
    showValidationModal,
    handleValidationResponse,
    closeValidationModal,
    clearValidationErrors
  };
};

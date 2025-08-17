import { useState } from 'react';
import toast from 'react-hot-toast';

/**
 * Hook universal para gerenciar erros de validação
 * Padroniza o tratamento de erros em todas as telas do sistema
 */
export const useValidation = () => {
  const [validationErrors, setValidationErrors] = useState(null);
  const [showValidationModal, setShowValidationModal] = useState(false);

  /**
   * Processa resposta do servidor e verifica se há erros de validação
   * @param {Object} response - Resposta do servidor
   * @param {string} successMessage - Mensagem de sucesso
   * @param {Function} onSuccess - Callback executado em caso de sucesso
   * @returns {boolean} - true se houve sucesso, false se houve erro
   */
  const handleServerResponse = (response, successMessage = 'Operação realizada com sucesso', onSuccess = null) => {
    if (response.success) {
      toast.success(successMessage);
      if (onSuccess) onSuccess();
      return true;
    } else {
      // Verificar se são erros de validação
      if (response.validationErrors || response.errorCategories) {
        setValidationErrors({
          errors: response.validationErrors,
          errorCategories: response.errorCategories
        });
        setShowValidationModal(true);
      } else {
        toast.error(response.error || 'Erro ao processar solicitação');
      }
      return false;
    }
  };

  /**
   * Fecha o modal de validação e limpa os erros
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
    handleServerResponse,
    closeValidationModal,
    clearValidationErrors
  };
};

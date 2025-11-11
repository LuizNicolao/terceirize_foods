import { useState, useCallback } from 'react';

export const useValidation = () => {
  const [validationErrors, setValidationErrors] = useState(null);
  const [showValidationModal, setShowValidationModal] = useState(false);

  const handleApiResponse = useCallback((response) => {
    if (response && response.validationErrors) {
      setValidationErrors({
        errors: response.validationErrors,
        errorCategories: response.errorCategories
      });
      setShowValidationModal(true);
      return true;
    }
    return false;
  }, []);

  const handleCloseValidationModal = useCallback(() => {
    setShowValidationModal(false);
  }, []);

  const clearValidationErrors = useCallback(() => {
    setValidationErrors(null);
  }, []);

  return {
    validationErrors,
    showValidationModal,
    handleApiResponse,
    handleCloseValidationModal,
    clearValidationErrors
  };
};


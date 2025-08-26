import { useState } from 'react';

export const useSupervisorForm = () => {
  const [formData, setFormData] = useState({
    observacoes: '',
    justificativa: '',
    decisao: 'enviar_gestor'
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      observacoes: '',
      justificativa: '',
      decisao: 'enviar_gestor'
    });
  };

  return {
    formData,
    handleInputChange,
    resetForm
  };
};

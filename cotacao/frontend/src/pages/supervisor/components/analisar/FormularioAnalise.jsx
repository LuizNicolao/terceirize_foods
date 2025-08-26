import React from 'react';
import DecisaoButtons from './DecisaoButtons';
import ObservacoesFields from './ObservacoesFields';
import SubmitButton from './SubmitButton';

const FormularioAnalise = ({ 
  formData, 
  onInputChange, 
  onSubmit, 
  analisando 
}) => {
  const handleDecisaoChange = (decisao) => {
    onInputChange('decisao', decisao);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Decisão do Supervisor</h3>
      <form onSubmit={onSubmit} className="space-y-4">
        <DecisaoButtons 
          decisao={formData.decisao}
          onDecisaoChange={handleDecisaoChange}
        />
        
        <ObservacoesFields 
          formData={formData}
          onInputChange={onInputChange}
        />
        
        <SubmitButton 
          analisando={analisando}
        />
      </form>
    </div>
  );
};

export default FormularioAnalise;

import React from 'react';

const ObservacoesFields = ({ formData, onInputChange }) => {
  return (
    <div className="space-y-4">
      {/* Observações */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Observações
        </label>
        <textarea
          value={formData.observacoes}
          onChange={(e) => onInputChange('observacoes', e.target.value)}
          placeholder="Digite suas observações sobre a cotação..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Justificativa */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Justificativa
        </label>
        <textarea
          value={formData.justificativa}
          onChange={(e) => onInputChange('justificativa', e.target.value)}
          placeholder="Digite a justificativa para a decisão..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
};

export default ObservacoesFields;

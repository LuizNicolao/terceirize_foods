import React from 'react';
import { FaStickyNote } from 'react-icons/fa';
import { Input } from '../ui';

const RotasNutricionistasObservacoes = ({ register, isViewMode = false }) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500 flex items-center">
        <FaStickyNote className="h-4 w-4 text-green-600 mr-2" />
        Observações
      </h3>
      <div className="space-y-3">
        <Input
          label="Observações"
          type="textarea"
          rows={4}
          placeholder="Observações adicionais sobre a rota nutricionista..."
          {...register('observacoes')}
          disabled={isViewMode}
        />
      </div>
    </div>
  );
};

export default RotasNutricionistasObservacoes;

import React from 'react';
import { Input } from '../ui';

const RotasNutricionistasInfoBasicas = ({ register, isViewMode = false }) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
        Informações Básicas
      </h3>
      <div className="space-y-3">
        <Input
          label="Código *"
          type="text"
          placeholder="Código da rota nutricionista"
          {...register('codigo')}
          disabled={isViewMode}
        />

        <Input
          label="Status"
          type="select"
          {...register('status')}
          disabled={isViewMode}
        >
          <option value="">Selecione o status</option>
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
        </Input>
      </div>
    </div>
  );
};

export default RotasNutricionistasInfoBasicas;

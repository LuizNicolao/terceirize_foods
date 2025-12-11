import React from 'react';
import { FaShoppingCart, FaSave } from 'react-icons/fa';
import { Button } from '../../ui';

const opcoesDiasSemana = [
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sábado' },
  { value: 7, label: 'Domingo' }
];

const DiasConsumoConfig = ({ diasConsumo, onToggle, onSalvar, loading }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <FaShoppingCart className="h-5 w-5 text-purple-600 mr-2" />
          Dias de Consumo
        </h3>
        <Button
          onClick={onSalvar}
          variant="primary"
          size="sm"
          disabled={loading}
        >
          <FaSave className="h-4 w-4 mr-2" />
          Salvar
        </Button>
      </div>
      
      <div className="space-y-2">
        {opcoesDiasSemana.map((dia) => (
          <label key={dia.value} className="flex items-center">
            <input
              type="checkbox"
              checked={diasConsumo.includes(dia.value)}
              onChange={() => onToggle(dia.value)}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">{dia.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default DiasConsumoConfig;


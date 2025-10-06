import React from 'react';
import { Input } from '../ui';
import { FaCalendarAlt, FaBuilding } from 'react-icons/fa';

const RegistroFormFields = ({ 
  data, 
  selectedEscolaId, 
  escolas, 
  onDataChange, 
  onEscolaChange 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {/* Campo Data */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <FaCalendarAlt className="inline mr-2" />
          Data
        </label>
        <input
          type="date"
          value={data}
          onChange={(e) => onDataChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
          required
        />
      </div>

      {/* Campo Escola */}
      <div>
        <Input
          label="Escola"
          type="select"
          value={selectedEscolaId}
          onChange={(e) => onEscolaChange(e.target.value)}
          required
        >
          <option value="">Selecione uma escola</option>
          {escolas.map(escola => (
            <option key={escola.id} value={escola.id}>
              {escola.nome}
            </option>
          ))}
        </Input>
      </div>
    </div>
  );
};

export default RegistroFormFields;

import React from 'react';
import { FaEdit } from 'react-icons/fa';
import { StatusBadge } from '../../necessidades';

const AjusteHeader = ({ 
  activeTab, 
  statusAtual
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center">
          <FaEdit className="mr-2 sm:mr-3 text-blue-600" />
          {activeTab === 'nutricionista' 
            ? 'Ajuste de Necessidade por Nutricionista' 
            : 'Ajuste de Necessidade por Coordenação'}
        </h1>
        <p className="text-gray-600 mt-1">
          {activeTab === 'nutricionista' 
            ? 'Visualize, edite e ajuste necessidades geradas' 
            : 'Visualize, edite e ajuste necessidades para coordenação'}
        </p>
      </div>
      <StatusBadge status={statusAtual} />
    </div>
  );
};

export default AjusteHeader;

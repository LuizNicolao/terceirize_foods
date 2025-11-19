import React from 'react';
import { FaSchool, FaLayerGroup } from 'react-icons/fa';

const AjusteResumoCards = ({ escolas = [], grupos = [] }) => {
  // Garantir que são arrays
  const escolasArray = Array.isArray(escolas) ? escolas : [];
  const gruposArray = Array.isArray(grupos) ? grupos : [];

  const totalEscolas = escolasArray.length;
  const totalGrupos = gruposArray.length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
      {/* Card de Escolas */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <div className="flex items-center gap-2">
          <FaSchool className="text-gray-400 text-sm" />
          <div>
            <p className="text-xs text-gray-500">Escolas Pendentes</p>
            <p className="text-base font-semibold text-gray-700">{totalEscolas}</p>
          </div>
        </div>
      </div>

      {/* Card de Grupos */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <div className="flex items-center gap-2">
          <FaLayerGroup className="text-gray-400 text-sm" />
          <div>
            <p className="text-xs text-gray-500">Grupos Pendentes</p>
            <p className="text-base font-semibold text-gray-700">{totalGrupos}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AjusteResumoCards;


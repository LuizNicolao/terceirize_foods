/**
 * Componente de controle para alternar entre modos de visualização
 * Padrão, Individual e Consolidado
 */

import React from 'react';
import { FaList, FaLayerGroup, FaBox } from 'react-icons/fa';

const ControleVisualizacaoListagem = ({
  modoVisualizacao,
  onModoVisualizacaoChange,
  onPageReset = () => {}
}) => {
  const handleModoChange = (modo) => {
    onModoVisualizacaoChange(modo);
    onPageReset();
  };

  return (
    <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => handleModoChange('padrao')}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
          modoVisualizacao === 'padrao'
            ? 'bg-white text-green-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
        title="Visualização Padrão (Agrupada por Necessidade)"
      >
        <FaBox className="w-4 h-4" />
        Padrão
      </button>
      <button
        onClick={() => handleModoChange('individual')}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
          modoVisualizacao === 'individual'
            ? 'bg-white text-green-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
        title="Visualização Individual"
      >
        <FaList className="w-4 h-4" />
        Individual
      </button>
      <button
        onClick={() => handleModoChange('consolidado')}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
          modoVisualizacao === 'consolidado'
            ? 'bg-white text-green-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
        title="Visualização Consolidada (Agrupada por Produto)"
      >
        <FaLayerGroup className="w-4 h-4" />
        Consolidado
      </button>
    </div>
  );
};

export default ControleVisualizacaoListagem;


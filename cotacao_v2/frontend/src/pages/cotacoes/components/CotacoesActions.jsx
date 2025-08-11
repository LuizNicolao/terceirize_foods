import React from 'react';
import { FaPlus, FaDownload, FaUpload } from 'react-icons/fa';

const CotacoesActions = ({ handleNovaCotacao }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Cotações
        </h1>
        <p className="text-gray-600">
          Gerencie todas as cotações do sistema
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        {/* Botão Nova Cotação */}
        <button
          onClick={handleNovaCotacao}
          className="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
        >
          <FaPlus className="mr-2" />
          Nova Cotação
        </button>

        {/* Botão Exportar */}
        <button
          className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          <FaDownload className="mr-2" />
          Exportar
        </button>

        {/* Botão Importar */}
        <button
          className="inline-flex items-center px-4 py-2 bg-purple-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
        >
          <FaUpload className="mr-2" />
          Importar
        </button>
      </div>
    </div>
  );
};

export default CotacoesActions;

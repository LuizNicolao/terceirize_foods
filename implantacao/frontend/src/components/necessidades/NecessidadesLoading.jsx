import React from 'react';

const NecessidadesLoading = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-4"></div>
        <p className="text-gray-600 text-sm">Carregando dados...</p>
      </div>
    </div>
  );
};

export default NecessidadesLoading;

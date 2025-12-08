import React from 'react';

const AnaliseLoadingState = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Carregando necessidades...</p>
    </div>
  );
};

export default AnaliseLoadingState;


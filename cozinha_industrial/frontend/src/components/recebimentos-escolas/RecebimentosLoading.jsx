import React from 'react';

const RecebimentosLoading = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-2 text-gray-600">Carregando recebimentos...</span>
      </div>
      <div className="mt-6 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 rounded-md animate-pulse"></div>
        ))}
      </div>
    </div>
  );
};

export default RecebimentosLoading;

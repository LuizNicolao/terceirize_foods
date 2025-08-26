import React from 'react';

export const LoadingState = () => (
  <div className="p-0">
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-12">
      <div className="text-5xl mb-4 animate-pulse">⏱</div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">
        Carregando cotação...
      </h2>
      <p className="text-gray-600 text-base mb-6">
        Aguarde um momento
      </p>
    </div>
  </div>
);

export const ErrorState = ({ error, onRetry }) => (
  <div className="p-0">
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-12">
      <div className="text-5xl mb-4 text-red-500">✗</div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">
        Erro ao carregar cotação
      </h2>
      <p className="text-gray-600 text-base mb-6">
        {error}
      </p>
      <button
        onClick={onRetry}
        className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-600 transition-colors hover:-translate-y-0.5"
      >
        Tentar Novamente
      </button>
    </div>
  </div>
);

export const NotFoundState = () => (
  <div className="p-0">
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-12">
      <div className="text-5xl mb-4 text-gray-500">📋</div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">
        Cotação não encontrada
      </h2>
      <p className="text-gray-600 text-base mb-6">
        A cotação solicitada não foi encontrada
      </p>
    </div>
  </div>
);

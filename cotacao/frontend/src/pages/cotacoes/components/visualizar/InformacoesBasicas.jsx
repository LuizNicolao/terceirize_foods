import React from 'react';

const InformacoesBasicas = ({ cotacao }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-3 border-b-2 border-green-500">
        Informações Básicas
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-gray-600 text-sm font-semibold uppercase tracking-wide">
            Comprador
          </label>
          <span className="text-gray-800 text-base font-medium">
            {cotacao.comprador}
          </span>
        </div>
        
        <div className="flex flex-col gap-2">
          <label className="text-gray-600 text-sm font-semibold uppercase tracking-wide">
            Local de Entrega
          </label>
          <span className="text-gray-800 text-base font-medium">
            {cotacao.local_entrega}
          </span>
        </div>
        
        <div className="flex flex-col gap-2">
          <label className="text-gray-600 text-sm font-semibold uppercase tracking-wide">
            Tipo de Compra
          </label>
          <span className="text-gray-800 text-base font-medium">
            {cotacao.tipo_compra === 'programada' ? 'Programada' : 'Emergencial'}
          </span>
        </div>
        
        {cotacao.tipo_compra === 'emergencial' && (
          <div className="flex flex-col gap-2">
            <label className="text-gray-600 text-sm font-semibold uppercase tracking-wide">
              Motivo Emergencial
            </label>
            <span className="text-gray-800 text-base font-medium">
              {cotacao.motivo_emergencial || 'Não informado'}
            </span>
          </div>
        )}
        
        <div className="flex flex-col gap-2 col-span-full">
          <label className="text-gray-600 text-sm font-semibold uppercase tracking-wide">
            Justificativa
          </label>
          <span className="text-gray-800 text-base font-medium">
            {cotacao.justificativa || 'Não informada'}
          </span>
        </div>
        
        {cotacao.motivo_final && (
          <div className="flex flex-col gap-2 col-span-full">
            <label className="text-gray-600 text-sm font-semibold uppercase tracking-wide">
              Motivo Final
            </label>
            <span className="text-gray-800 text-base font-medium">
              {cotacao.motivo_final}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default InformacoesBasicas;

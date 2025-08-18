import React from 'react';
import { ChartCard } from '../ui';

export const DashboardSystemInfo = ({ statsData }) => {
  return (
    <ChartCard title="Informações do Sistema">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Veículos Doc. Vencendo</span>
          <span className="text-sm font-medium text-gray-900">
            {statsData.veiculosDocumentacaoVencendo}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Motoristas CNH Vencendo</span>
          <span className="text-sm font-medium text-gray-900">
            {statsData.motoristasCnhVencendo}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Status</span>
          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
            Online
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Banco de Dados</span>
          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
            Conectado
          </span>
        </div>
      </div>
    </ChartCard>
  );
};

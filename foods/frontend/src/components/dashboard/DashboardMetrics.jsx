import React from 'react';
import { ChartCard } from '../ui';
import { formatCurrency } from '../../utils/dashboardUtils';

export const DashboardMetrics = ({ statsData }) => {
  return (
    <ChartCard title="Métricas de Performance">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(statsData.valorEstoque)}
          </div>
          <div className="text-sm text-gray-600">Valor Total em Estoque</div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-900">
            {statsData.produtosEstoqueBaixo}
          </div>
          <div className="text-sm text-gray-600">Produtos com Estoque Baixo</div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-900">
            {statsData.produtosSemEstoque}
          </div>
          <div className="text-sm text-gray-600">Produtos Sem Estoque</div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-900">
            {statsData.produtosVencendo}
          </div>
          <div className="text-sm text-gray-600">Produtos Vencendo</div>
        </div>
      </div>
    </ChartCard>
  );
};

import React from 'react';

const DashboardCharts = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Resumo de Cotações
      </h3>
      
      <div className="h-64 flex items-center justify-center text-gray-500 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <div className="text-sm">
            Gráfico de cotações por status
          </div>
          <div className="text-xs text-gray-400 mt-1">
            (implementar com biblioteca de gráficos)
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;

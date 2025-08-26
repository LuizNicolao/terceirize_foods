import React from 'react';

const DashboardChart = () => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Resumo de Cotações</h3>
      <div className="h-80 flex items-center justify-center text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        Gráfico de cotações por status (implementar com biblioteca de gráficos)
      </div>
    </div>
  );
};

export default DashboardChart;

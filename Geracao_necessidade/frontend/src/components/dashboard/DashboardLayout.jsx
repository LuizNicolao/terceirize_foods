import React from 'react';

const DashboardLayout = ({ children }) => {
  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600">Visão geral do sistema de necessidades</p>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="space-y-4 md:space-y-6">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;

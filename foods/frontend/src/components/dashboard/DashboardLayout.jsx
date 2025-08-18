import React from 'react';

export const DashboardLayout = ({ children }) => {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600">
          Visão geral do sistema de terceirização de alimentos
        </p>
      </div>

      {children}
    </div>
  );
};

import React from 'react';

export const DashboardLoading = () => {
  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando dashboard...</p>
      </div>
    </div>
  );
};

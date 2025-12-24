import React from 'react';

const ChartCard = ({ 
  title, 
  children, 
  className = '',
  loading = false 
}) => {
  return (
    <div className={`bg-white rounded-xl p-6 shadow-sm border border-gray-200 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {title}
      </h3>
      
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      ) : (
        <div className="min-h-[200px]">
          {children}
        </div>
      )}
    </div>
  );
};

export default ChartCard; 
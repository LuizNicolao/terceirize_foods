import React from 'react';
import { FaBox, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const ProdutosOrigemStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <FaBox className="h-8 w-8 text-blue-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Total</p>
            <p className="text-2xl font-semibold text-gray-900">{stats?.total || 0}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <FaCheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Ativos</p>
            <p className="text-2xl font-semibold text-gray-900">{stats?.ativos || 0}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <FaTimesCircle className="h-8 w-8 text-red-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Inativos</p>
            <p className="text-2xl font-semibold text-gray-900">{stats?.inativos || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProdutosOrigemStats;
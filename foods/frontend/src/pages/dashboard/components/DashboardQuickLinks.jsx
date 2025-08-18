import React from 'react';
import { FaUsers, FaTruck, FaBox, FaRoute } from 'react-icons/fa';
import { ChartCard } from '../../../components/ui';

export const DashboardQuickLinks = () => {
  return (
    <ChartCard title="Acesso Rápido">
      <div className="space-y-2">
        <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
          <div className="flex items-center">
            <FaUsers className="mr-3 text-blue-500" />
            <span className="text-sm font-medium text-gray-900">Gerenciar Usuários</span>
          </div>
        </button>
        
        <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
          <div className="flex items-center">
            <FaTruck className="mr-3 text-green-500" />
            <span className="text-sm font-medium text-gray-900">Gerenciar Veículos</span>
          </div>
        </button>
        
        <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
          <div className="flex items-center">
            <FaBox className="mr-3 text-purple-500" />
            <span className="text-sm font-medium text-gray-900">Gerenciar Produtos</span>
          </div>
        </button>
        
        <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
          <div className="flex items-center">
            <FaRoute className="mr-3 text-teal-500" />
            <span className="text-sm font-medium text-gray-900">Gerenciar Rotas</span>
          </div>
        </button>
      </div>
    </ChartCard>
  );
};

import React from 'react';
import { FaClock, FaExclamationTriangle, FaCheckCircle, FaChartBar } from 'react-icons/fa';

const AprovacoesStats = ({ stats }) => {
  const statCards = [
    {
      title: 'Aguardando Aprovação',
      value: stats?.aguardando_aprovacao || 0,
      icon: FaClock,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-500'
    },
    {
      title: 'Total de Cotações',
      value: stats?.aguardando_aprovacao || 0,
      icon: FaChartBar,
      color: 'bg-purple-500',
      textColor: 'text-purple-500'
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6">
      {statCards.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 md:p-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs md:text-sm font-medium text-gray-600 truncate">{stat.title}</p>
              <p className="text-lg md:text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
            <div className={`p-2 md:p-3 rounded-lg ${stat.color} bg-opacity-10 flex-shrink-0`}>
              <stat.icon className={`w-4 h-4 md:w-5 md:h-5 ${stat.textColor}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AprovacoesStats;

import React from 'react';
import { 
  FaClock, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaSearch,
  FaFileAlt
} from 'react-icons/fa';

const CotacoesStats = ({ statusCounts, handleStatusFilter, getStatusColor }) => {
  const statCards = [
    {
      id: 'total',
      icon: FaFileAlt,
      value: statusCounts.total,
      label: 'Total de Cotações',
      color: '#6B7280',
      bgColor: 'bg-gray-500'
    },
    {
      id: 'pendente',
      icon: FaClock,
      value: statusCounts.pendente,
      label: 'Pendentes',
      color: '#F59E0B',
      bgColor: 'bg-yellow-500'
    },
    {
      id: 'aprovada',
      icon: FaCheckCircle,
      value: statusCounts.aprovada,
      label: 'Aprovadas',
      color: '#10B981',
      bgColor: 'bg-green-500'
    },
    {
      id: 'rejeitada',
      icon: FaTimesCircle,
      value: statusCounts.rejeitada,
      label: 'Rejeitadas',
      color: '#EF4444',
      bgColor: 'bg-red-500'
    },
    {
      id: 'em_analise',
      icon: FaSearch,
      value: statusCounts.em_analise,
      label: 'Em Análise',
      color: '#3B82F6',
      bgColor: 'bg-blue-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      {statCards.map((card) => (
        <div
          key={card.id}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-300 cursor-pointer"
          onClick={() => handleStatusFilter(card.id)}
        >
          <div className="flex items-center justify-between mb-4">
            <div 
              className={`w-12 h-12 rounded-lg flex items-center justify-center text-white ${card.bgColor}`}
              style={{ backgroundColor: card.color }}
            >
              <card.icon className="text-xl" />
            </div>
          </div>
          
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {card.value}
          </div>
          
          <div className="text-sm font-medium text-gray-700">
            {card.label}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CotacoesStats;

import React from 'react';
import { 
  FaTruck, 
  FaCheckCircle, 
  FaClock, 
  FaTimesCircle, 
  FaDollarSign,
  FaUsers
} from 'react-icons/fa';

const DashboardStats = ({ stats, formatCurrency }) => {
  const statCards = [
    {
      icon: FaTruck,
      value: stats?.totalCotacoes || 0,
      label: 'Total de Cotações',
      subtitle: 'Este mês',
      color: 'bg-blue-500',
      iconColor: '#3B82F6'
    },
    {
      icon: FaClock,
      value: stats?.cotacoesPendentes || 0,
      label: 'Cotações Pendentes',
      subtitle: 'Aguardando aprovação',
      color: 'bg-yellow-500',
      iconColor: '#F59E0B'
    },
    {
      icon: FaCheckCircle,
      value: stats?.cotacoesAprovadas || 0,
      label: 'Cotações Aprovadas',
      subtitle: 'Este mês',
      color: 'bg-green-500',
      iconColor: '#10B981'
    },
    {
      icon: FaTimesCircle,
      value: stats?.cotacoesRejeitadas || 0,
      label: 'Cotações Rejeitadas',
      subtitle: 'Este mês',
      color: 'bg-red-500',
      iconColor: '#EF4444'
    },
    {
      icon: FaDollarSign,
      value: formatCurrency(stats?.totalEconomia || 0),
      label: 'Economia Total',
      subtitle: 'Este mês',
      color: 'bg-green-500',
      iconColor: '#10B981'
    },
    {
      icon: FaUsers,
      value: stats?.usuariosAtivos || 0,
      label: 'Usuários Ativos',
      subtitle: 'No sistema',
      color: 'bg-purple-500',
      iconColor: '#8B5CF6'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {statCards.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-300 cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <div 
              className={`w-12 h-12 rounded-lg flex items-center justify-center text-white ${card.color}`}
              style={{ backgroundColor: card.iconColor }}
            >
              <card.icon className="text-xl" />
            </div>
          </div>
          
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {card.value}
          </div>
          
          <div className="text-sm font-medium text-gray-700 mb-1">
            {card.label}
          </div>
          
          <div className="text-xs text-gray-500">
            {card.subtitle}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;

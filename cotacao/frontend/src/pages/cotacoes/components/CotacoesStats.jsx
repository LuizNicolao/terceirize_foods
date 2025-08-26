import React from 'react';
import { FaFileAlt, FaClock, FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaExchangeAlt } from 'react-icons/fa';

const CotacoesStats = ({ cotacoes }) => {
  const stats = {
    total: cotacoes.length,
    pendente: cotacoes.filter(c => c.status === 'pendente').length,
    em_analise: cotacoes.filter(c => c.status === 'em_analise').length,
    aprovada: cotacoes.filter(c => c.status === 'aprovada').length,
    reprovada: cotacoes.filter(c => c.status === 'reprovada').length,
    em_renegociacao: cotacoes.filter(c => c.status === 'em_renegociacao').length
  };

  const statCards = [
    {
      title: 'Total',
      value: stats.total,
      icon: FaFileAlt,
      color: 'bg-blue-500',
      textColor: 'text-blue-500'
    },
    {
      title: 'Pendentes',
      value: stats.pendente,
      icon: FaClock,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-500'
    },
    {
      title: 'Em Análise',
      value: stats.em_analise,
      icon: FaExclamationTriangle,
      color: 'bg-orange-500',
      textColor: 'text-orange-500'
    },
    {
      title: 'Aprovadas',
      value: stats.aprovada,
      icon: FaCheckCircle,
      color: 'bg-green-500',
      textColor: 'text-green-500'
    },
    {
      title: 'Reprovadas',
      value: stats.reprovada,
      icon: FaTimesCircle,
      color: 'bg-red-500',
      textColor: 'text-red-500'
    },
    {
      title: 'Em Renegociação',
      value: stats.em_renegociacao,
      icon: FaExchangeAlt,
      color: 'bg-purple-500',
      textColor: 'text-purple-500'
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-6 gap-3 md:gap-4 mb-6">
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

export default CotacoesStats;

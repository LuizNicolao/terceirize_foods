import React from 'react';
import { FaClock, FaExclamationTriangle, FaExchangeAlt, FaChartLine } from 'react-icons/fa';

const SupervisorStats = ({ statusStats, handleStatusFilter }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'aguardandoAnalise':
        return 'bg-blue-500';
      case 'emRenegociacao':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'aguardandoAnalise':
        return <FaClock className="text-2xl" />;
      case 'emRenegociacao':
        return <FaExchangeAlt className="text-2xl" />;
      default:
        return <FaChartLine className="text-2xl" />;
    }
  };

  const stats = [
    {
      key: 'total',
      label: 'Total de Cotações',
      value: statusStats.total,
      color: 'bg-gray-500',
      icon: <FaChartLine className="text-2xl" />
    },
    {
      key: 'aguardandoAnalise',
      label: 'Aguardando Análise',
      value: statusStats.aguardandoAnalise,
      color: 'bg-blue-500',
      icon: <FaClock className="text-2xl" />
    },
    {
      key: 'emRenegociacao',
      label: 'Em Renegociação',
      value: statusStats.emRenegociacao,
      color: 'bg-orange-500',
      icon: <FaExchangeAlt className="text-2xl" />
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {stats.map((stat) => (
        <div
          key={stat.key}
          className={`${stat.color} text-white rounded-lg p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg`}
          onClick={() => handleStatusFilter && handleStatusFilter(stat.key)}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">{stat.label}</p>
              <p className="text-3xl font-bold">{stat.value}</p>
            </div>
            <div className="opacity-80">
              {stat.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SupervisorStats;

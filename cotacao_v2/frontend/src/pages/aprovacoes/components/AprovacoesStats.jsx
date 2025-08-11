import React from 'react';
import { FaClock, FaUserCheck, FaThumbsUp, FaThumbsDown, FaExchangeAlt } from 'react-icons/fa';

const AprovacoesStats = ({ statusStats, handleStatusFilter }) => {
  const stats = [
    {
      key: 'aguardandoAprovacao',
      label: 'Aguardando Aprovação',
      value: statusStats.aguardandoAprovacao,
      color: 'bg-yellow-500',
      icon: <FaClock className="text-2xl" />
    },
    {
      key: 'aguardandoSupervisor',
      label: 'Aguardando Supervisor',
      value: statusStats.aguardandoSupervisor,
      color: 'bg-blue-500',
      icon: <FaUserCheck className="text-2xl" />
    },
    {
      key: 'aprovadas',
      label: 'Aprovadas',
      value: statusStats.aprovadas,
      color: 'bg-green-500',
      icon: <FaThumbsUp className="text-2xl" />
    },
    {
      key: 'rejeitadas',
      label: 'Rejeitadas',
      value: statusStats.rejeitadas,
      color: 'bg-red-500',
      icon: <FaThumbsDown className="text-2xl" />
    },
    {
      key: 'renegociacao',
      label: 'Em Renegociação',
      value: statusStats.renegociacao,
      color: 'bg-orange-500',
      icon: <FaExchangeAlt className="text-2xl" />
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
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

export default AprovacoesStats;

import React from 'react';
import { FaBuilding, FaCheckCircle, FaTimesCircle, FaMapMarkerAlt } from 'react-icons/fa';
import { StatCard } from '../ui';

const FiliaisStats = ({ stats }) => {
  const statsData = [
    {
      title: 'Total de Filiais',
      value: stats?.total || 0,
      icon: FaBuilding,
      color: 'blue',
      change: null,
      description: 'Filiais cadastradas no Foods'
    },
    {
      title: 'Filiais Ativas',
      value: stats?.ativos || 0,
      icon: FaCheckCircle,
      color: 'green',
      change: null,
      description: 'Filiais com status ativo'
    },
    {
      title: 'Filiais Inativas',
      value: stats?.inativos || 0,
      icon: FaTimesCircle,
      color: 'red',
      change: null,
      description: 'Filiais com status inativo'
    },
    {
      title: 'Última Consulta',
      value: 'Agora',
      icon: FaMapMarkerAlt,
      color: 'purple',
      change: null,
      description: 'Dados atualizados em tempo real'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statsData.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          color={stat.color}
          change={stat.change}
        />
      ))}
    </div>
  );
};

export default FiliaisStats;

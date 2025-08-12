import React from 'react';
import { FaBuilding, FaCheckCircle, FaTimesCircle, FaMapMarkerAlt } from 'react-icons/fa';
import { StatCard } from '../ui';

const FiliaisStats = ({ estatisticas }) => {
  const stats = [
    {
      title: 'Total de Filiais',
      value: estatisticas.total_filiais || 0,
      icon: FaBuilding,
      color: 'blue',
      change: null
    },
    {
      title: 'Filiais Ativas',
      value: estatisticas.filiais_ativas || 0,
      icon: FaCheckCircle,
      color: 'green',
      change: null
    },
    {
      title: 'Filiais Inativas',
      value: estatisticas.filiais_inativas || 0,
      icon: FaTimesCircle,
      color: 'red',
      change: null
    },
    {
      title: 'Com CNPJ',
      value: estatisticas.com_cnpj || 0,
      icon: FaMapMarkerAlt,
      color: 'purple',
      change: null
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
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

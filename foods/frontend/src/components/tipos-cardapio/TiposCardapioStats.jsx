import React from 'react';
import { FaClipboardList, FaCheckCircle, FaTimesCircle, FaBuilding } from 'react-icons/fa';
import { StatCard } from '../ui';

const TiposCardapioStats = ({ estatisticas = {} }) => {
  const stats = [
    {
      title: 'Total de Tipos',
      value: estatisticas.total_tipos || 0,
      icon: FaClipboardList,
      color: 'blue'
    },
    {
      title: 'Tipos Ativos',
      value: estatisticas.tipos_ativos || 0,
      icon: FaCheckCircle,
      color: 'green'
    },
    {
      title: 'Tipos Inativos',
      value: estatisticas.tipos_inativos || 0,
      icon: FaTimesCircle,
      color: 'red'
    },
    {
      title: 'Filiais Vinculadas',
      value: estatisticas.filiais_vinculadas || 0,
      icon: FaBuilding,
      color: 'purple'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-6">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          color={stat.color}
        />
      ))}
    </div>
  );
};

export default TiposCardapioStats;

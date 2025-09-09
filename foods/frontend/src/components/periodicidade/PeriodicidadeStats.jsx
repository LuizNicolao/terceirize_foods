import React from 'react';
import { FaCalendarAlt, FaCheckCircle, FaBuilding, FaBox } from 'react-icons/fa';
import { StatCard } from '../ui';

const PeriodicidadeStats = ({ estatisticas = {} }) => {
  const stats = [
    {
      title: 'Total de Agrupamentos',
      value: estatisticas.total_agrupamentos || 0,
      icon: FaCalendarAlt,
      color: 'blue'
    },
    {
      title: 'Agrupamentos Ativos',
      value: estatisticas.agrupamentos_ativos || 0,
      icon: FaCheckCircle,
      color: 'green'
    },
    {
      title: 'Escolas Vinculadas',
      value: estatisticas.escolas_vinculadas || 0,
      icon: FaBuilding,
      color: 'purple'
    },
    {
      title: 'Produtos Vinculados',
      value: estatisticas.produtos_vinculados || 0,
      icon: FaBox,
      color: 'orange'
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
        />
      ))}
    </div>
  );
};

export default PeriodicidadeStats;

import React from 'react';
import { FaUtensils, FaCheckCircle, FaTimesCircle, FaBuilding } from 'react-icons/fa';
import { StatCard } from '../ui';

const PeriodosRefeicaoStats = ({ stats = {} }) => {
  const statistics = [
    {
      title: 'Total de Períodos',
      value: stats.total_periodos || 0,
      icon: FaUtensils,
      color: 'blue'
    },
    {
      title: 'Períodos Ativos',
      value: stats.periodos_ativos || 0,
      icon: FaCheckCircle,
      color: 'green'
    },
    {
      title: 'Períodos Inativos',
      value: stats.periodos_inativos || 0,
      icon: FaTimesCircle,
      color: 'red'
    },
    {
      title: 'Filiais Vinculadas',
      value: stats.filiais_vinculadas || 0,
      icon: FaBuilding,
      color: 'purple'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-6">
      {statistics.map((stat, index) => (
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

export default PeriodosRefeicaoStats;

import React from 'react';
import { FaAllergies, FaCheckCircle, FaTimesCircle, FaList } from 'react-icons/fa';
import { StatCard } from '../ui';

const IntoleranciasStats = ({ estatisticas }) => {
  const stats = [
    {
      title: 'Total de Intolerâncias',
      value: estatisticas.total_intolerancias || 0,
      icon: FaAllergies,
      color: 'blue',
      change: null
    },
    {
      title: 'Intolerâncias Ativas',
      value: estatisticas.intolerancias_ativas || 0,
      icon: FaCheckCircle,
      color: 'green',
      change: null
    },
    {
      title: 'Intolerâncias Inativas',
      value: estatisticas.intolerancias_inativas || 0,
      icon: FaTimesCircle,
      color: 'red',
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

export default IntoleranciasStats;

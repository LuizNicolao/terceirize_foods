import React from 'react';
import { FaUsers, FaCheckCircle, FaTimesCircle, FaList } from 'react-icons/fa';
import { StatCard } from '../ui';

const EfetivosStats = ({ estatisticas }) => {
  const stats = [
    {
      title: 'Total de Efetivos',
      value: estatisticas.total_efetivos || 0,
      icon: FaUsers,
      color: 'blue',
      change: null
    },
    {
      title: 'Efetivos Padrão',
      value: estatisticas.efetivos_padrao || 0,
      icon: FaCheckCircle,
      color: 'green',
      change: null
    },
    {
      title: 'Efetivos NAE',
      value: estatisticas.efetivos_nae || 0,
      icon: FaList,
      color: 'orange',
      change: null
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
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

export default EfetivosStats;

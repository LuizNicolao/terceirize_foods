import React from 'react';
import { FaUsers, FaUserCheck, FaUmbrellaBeach, FaUserClock } from 'react-icons/fa';
import { StatCard } from '../ui';

const AjudantesStats = ({ estatisticas }) => {
  const stats = [
    {
      title: 'Total de Ajudantes',
      value: estatisticas.total_ajudantes || 0,
      icon: <FaUsers className="text-blue-600" />,
      color: 'blue'
    },
    {
      title: 'Ajudantes Ativos',
      value: estatisticas.ajudantes_ativos || 0,
      icon: <FaUserCheck className="text-green-600" />,
      color: 'green'
    },
    {
      title: 'Em Férias',
      value: estatisticas.em_ferias || 0,
      icon: <FaUmbrellaBeach className="text-yellow-600" />,
      color: 'yellow'
    },
    {
      title: 'Em Licença',
      value: estatisticas.em_licenca || 0,
      icon: <FaUserClock className="text-red-600" />,
      color: 'red'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

export default AjudantesStats;

import React from 'react';
import { FaClipboardCheck, FaCheckCircle, FaTimesCircle, FaExclamationTriangle } from 'react-icons/fa';
import { StatCard } from '../ui';

const RIRStats = ({ estatisticas }) => {
  // Garantir valores padrão
  const stats = {
    total: estatisticas?.total ?? 0,
    aprovados: estatisticas?.aprovados ?? 0,
    reprovados: estatisticas?.reprovados ?? 0,
    parciais: estatisticas?.parciais ?? 0
  };

  const statsArray = [
    {
      title: 'Total de RIRs',
      value: stats.total,
      icon: FaClipboardCheck,
      color: 'blue'
    },
    {
      title: 'Aprovados',
      value: stats.aprovados,
      icon: FaCheckCircle,
      color: 'green'
    },
    {
      title: 'Reprovados',
      value: stats.reprovados,
      icon: FaTimesCircle,
      color: 'red'
    },
    {
      title: 'Parciais',
      value: stats.parciais,
      icon: FaExclamationTriangle,
      color: 'yellow'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {statsArray.map((stat, index) => (
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

export default RIRStats;


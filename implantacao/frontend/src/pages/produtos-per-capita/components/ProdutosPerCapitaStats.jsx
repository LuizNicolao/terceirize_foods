import React from 'react';
import { FaChartLine, FaBox, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { StatCard } from '../../../components/ui';

const ProdutosPerCapitaStats = ({ estatisticas = {} }) => {
  const stats = [
    {
      title: 'Total de Produtos',
      value: estatisticas.total_produtos || 0,
      icon: FaBox,
      color: 'blue'
    },
    {
      title: 'Produtos Ativos',
      value: estatisticas.produtos_ativos || 0,
      icon: FaCheckCircle,
      color: 'green'
    },
    {
      title: 'Produtos Inativos',
      value: estatisticas.produtos_inativos || 0,
      icon: FaTimesCircle,
      color: 'red'
    },
    {
      title: 'Produtos Únicos',
      value: estatisticas.produtos_unicos || 0,
      icon: FaChartLine,
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

export default ProdutosPerCapitaStats;

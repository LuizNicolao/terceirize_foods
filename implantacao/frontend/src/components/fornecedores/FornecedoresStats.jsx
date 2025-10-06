import React from 'react';
import { 
  FaBuilding, 
  FaIndustry, 
  FaTruck, 
  FaStore 
} from 'react-icons/fa';
import { StatCard } from '../ui';

const FornecedoresStats = ({ stats }) => {
  const statsData = [
    {
      title: 'Total de Fornecedores',
      value: stats?.total || 0,
      icon: FaBuilding,
      color: 'blue',
      description: 'Fornecedores cadastrados no Foods'
    },
    {
      title: 'Fornecedores Ativos',
      value: stats?.ativos || 0,
      icon: FaIndustry,
      color: 'green',
      description: 'Fornecedores em atividade'
    },
    {
      title: 'Fornecedores Inativos',
      value: stats?.inativos || 0,
      icon: FaTruck,
      color: 'red',
      description: 'Fornecedores inativos'
    },
    {
      title: 'Última Consulta',
      value: 'Agora',
      icon: FaStore,
      color: 'purple',
      description: 'Dados do sistema Foods'
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
          description={stat.description}
        />
      ))}
    </div>
  );
};

export default FornecedoresStats;

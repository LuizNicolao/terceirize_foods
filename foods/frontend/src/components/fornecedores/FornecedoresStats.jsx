import React from 'react';
import { 
  FaBuilding, 
  FaIndustry, 
  FaTruck, 
  FaStore 
} from 'react-icons/fa';
import { StatCard } from '../ui';

const FornecedoresStats = ({ estatisticas }) => {
  const stats = [
    {
      title: 'Total de Fornecedores',
      value: estatisticas.total_fornecedores || 0,
      icon: FaBuilding,
      color: 'blue',
      description: 'Fornecedores cadastrados'
    },
    {
      title: 'Fornecedores Ativos',
      value: estatisticas.fornecedores_ativos || 0,
      icon: FaIndustry,
      color: 'green',
      description: 'Fornecedores em atividade'
    },
    {
      title: 'Com Email',
      value: estatisticas.com_email || 0,
      icon: FaTruck,
      color: 'yellow',
      description: 'Fornecedores com email'
    },
    {
      title: 'Com Telefone',
      value: estatisticas.com_telefone || 0,
      icon: FaStore,
      color: 'purple',
      description: 'Fornecedores com telefone'
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
          description={stat.description}
        />
      ))}
    </div>
  );
};

export default FornecedoresStats;

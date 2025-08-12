import React from 'react';
import { FaBuilding, FaCheckCircle, FaEnvelope, FaPhone } from 'react-icons/fa';
import { StatCard } from '../ui';

const ClientesStats = ({ estatisticas }) => {
  const stats = [
    {
      title: 'Total de Clientes',
      value: estatisticas.total_clientes || 0,
      icon: FaBuilding,
      color: 'blue',
      change: null
    },
    {
      title: 'Clientes Ativos',
      value: estatisticas.clientes_ativos || 0,
      icon: FaCheckCircle,
      color: 'green',
      change: null
    },
    {
      title: 'Com Email',
      value: estatisticas.com_email || 0,
      icon: FaEnvelope,
      color: 'purple',
      change: null
    },
    {
      title: 'Com Telefone',
      value: estatisticas.com_telefone || 0,
      icon: FaPhone,
      color: 'orange',
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

export default ClientesStats;

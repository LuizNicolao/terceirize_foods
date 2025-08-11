import React from 'react';
import { FaChartLine, FaDollarSign, FaPercentage, FaCalendarAlt } from 'react-icons/fa';

const SavingStats = ({ resumo }) => {
  const stats = [
    {
      key: 'total_economia',
      label: 'Total de Economia',
      value: resumo.total_economia || 0,
      color: 'bg-green-500',
      icon: <FaDollarSign className="text-2xl" />,
      format: (value) => new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value)
    },
    {
      key: 'percentual_economia',
      label: 'Percentual de Economia',
      value: resumo.percentual_economia || 0,
      color: 'bg-blue-500',
      icon: <FaPercentage className="text-2xl" />,
      format: (value) => `${value.toFixed(2)}%`
    },
    {
      key: 'total_registros',
      label: 'Total de Registros',
      value: resumo.total_registros || 0,
      color: 'bg-purple-500',
      icon: <FaChartLine className="text-2xl" />,
      format: (value) => value.toLocaleString('pt-BR')
    },
    {
      key: 'media_economia',
      label: 'Média por Registro',
      value: resumo.media_economia || 0,
      color: 'bg-orange-500',
      icon: <FaCalendarAlt className="text-2xl" />,
      format: (value) => new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value)
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat) => (
        <div
          key={stat.key}
          className={`${stat.color} text-white rounded-lg p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">{stat.label}</p>
              <p className="text-3xl font-bold">{stat.format(stat.value)}</p>
            </div>
            <div className="opacity-80">
              {stat.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SavingStats;

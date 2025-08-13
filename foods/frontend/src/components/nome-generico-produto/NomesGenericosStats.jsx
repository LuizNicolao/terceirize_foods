import React from 'react';
import { FaBox, FaCheckCircle, FaTimesCircle, FaLink } from 'react-icons/fa';

const NomesGenericosStats = ({ estatisticas }) => {
  const stats = [
    {
      title: 'Total de Nomes Genéricos',
      value: estatisticas.total_nomes_genericos || 0,
      icon: FaBox,
      color: 'bg-blue-500',
      textColor: 'text-blue-500'
    },
    {
      title: 'Nomes Ativos',
      value: estatisticas.nomes_genericos_ativos || 0,
      icon: FaCheckCircle,
      color: 'bg-green-500',
      textColor: 'text-green-500'
    },
    {
      title: 'Nomes Inativos',
      value: estatisticas.nomes_genericos_inativos || 0,
      icon: FaTimesCircle,
      color: 'bg-red-500',
      textColor: 'text-red-500'
    },
    {
      title: 'Com Produtos Vinculados',
      value: estatisticas.produtos_vinculados || 0,
      icon: FaLink,
      color: 'bg-purple-500',
      textColor: 'text-purple-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                {stat.title}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stat.value.toLocaleString('pt-BR')}
              </p>
            </div>
            <div className={`p-3 rounded-full ${stat.color} bg-opacity-10`}>
              <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NomesGenericosStats;

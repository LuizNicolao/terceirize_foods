import React from 'react';
import { FaAllergies, FaCheckCircle, FaTimesCircle, FaTags } from 'react-icons/fa';

const IntoleranciasStats = ({ estatisticas }) => {
  const stats = [
    {
      name: 'Total de Intolerâncias',
      value: estatisticas.total_intolerancias || 0,
      icon: FaAllergies,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      name: 'Intolerâncias Ativas',
      value: estatisticas.intolerancias_ativas || 0,
      icon: FaCheckCircle,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      name: 'Intolerâncias Inativas',
      value: estatisticas.intolerancias_inativas || 0,
      icon: FaTimesCircle,
      color: 'bg-red-500',
      textColor: 'text-red-600'
    },
    {
      name: 'Nomes Únicos',
      value: estatisticas.nomes_unicos || 0,
      icon: FaTags,
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className={`flex-shrink-0 p-3 rounded-md ${stat.color}`}>
              <stat.icon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  {stat.name}
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {stat.value.toLocaleString('pt-BR')}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default IntoleranciasStats;

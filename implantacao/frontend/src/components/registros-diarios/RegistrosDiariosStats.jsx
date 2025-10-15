import React from 'react';
import { FaCalendarCheck, FaSchool, FaCalendarAlt, FaChartLine } from 'react-icons/fa';

const RegistrosDiariosStats = ({ estatisticas }) => {
  const stats = [
    {
      label: 'Total de Registros',
      value: estatisticas?.total_registros || 0,
      icon: FaCalendarCheck,
      color: 'bg-blue-100 text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Escolas Registradas',
      value: estatisticas?.total_escolas || 0,
      icon: FaSchool,
      color: 'bg-green-100 text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      label: 'Registros Mês Atual',
      value: estatisticas?.registros_mes_atual || 0,
      icon: FaCalendarAlt,
      color: 'bg-purple-100 text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      label: 'Médias Calculadas',
      value: estatisticas?.total_medias || 0,
      icon: FaChartLine,
      color: 'bg-orange-100 text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`${stat.bgColor} rounded-lg p-4 border border-gray-200 shadow-sm`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </div>
            <div className={`${stat.color} p-3 rounded-lg`}>
              <stat.icon className="h-6 w-6" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RegistrosDiariosStats;


import React from 'react';
import { FaTruck, FaCheckCircle, FaClock, FaExclamationTriangle, FaFlag } from 'react-icons/fa';

const CalendarStats = ({ statistics }) => {
  const stats = [
    {
      icon: FaTruck,
      label: 'Entregas',
      value: statistics.totalDeliveries,
      color: 'blue'
    },
    {
      icon: FaCheckCircle,
      label: 'Escolas',
      value: statistics.totalSchools,
      color: 'green'
    },
    {
      icon: FaClock,
      label: 'Produtos',
      value: statistics.totalProducts,
      color: 'purple'
    },
    {
      icon: FaExclamationTriangle,
      label: 'Conflitos',
      value: statistics.conflicts,
      color: 'red'
    },
    {
      icon: FaFlag,
      label: 'Feriados',
      value: statistics.holidays,
      color: 'orange'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      red: 'bg-red-100 text-red-600',
      orange: 'bg-orange-100 text-orange-600'
    };
    return colors[color] || 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${getColorClasses(stat.color)}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-lg font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CalendarStats;

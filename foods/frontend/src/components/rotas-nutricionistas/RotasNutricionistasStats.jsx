import React from 'react';
import { FaBuilding, FaSchool } from 'react-icons/fa';

const RotasNutricionistasStats = ({ rotasNutricionistas = [], unidadesEscolares = [] }) => {
  const totalRotas = rotasNutricionistas?.length || 0;
  const rotasAtivas = rotasNutricionistas?.filter(rota => rota.status === 'ativo')?.length || 0;
  const rotasInativas = rotasNutricionistas?.filter(rota => rota.status === 'inativo')?.length || 0;
  const totalUnidadesEscolares = unidadesEscolares?.length || 0;

  const stats = [
    {
      name: 'Total de Rotas',
      value: totalRotas,
      icon: FaBuilding,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      name: 'Rotas Ativas',
      value: rotasAtivas,
      icon: FaBuilding,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      name: 'Rotas Inativas',
      value: rotasInativas,
      icon: FaBuilding,
      color: 'bg-red-500',
      textColor: 'text-red-600'
    },
    {
      name: 'Unidades Escolares',
      value: totalUnidadesEscolares,
      icon: FaSchool,
      color: 'bg-orange-500',
      textColor: 'text-orange-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center">
            <div className={`flex-shrink-0 p-3 rounded-lg ${stat.color} bg-opacity-10`}>
              <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">{stat.name}</p>
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RotasNutricionistasStats;

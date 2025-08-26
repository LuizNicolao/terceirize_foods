import React from 'react';
import { FaUsers, FaUserCheck, FaUserTimes, FaUserCog } from 'react-icons/fa';

const UsuariosStats = ({ usuarios }) => {
  // Garantir que usuarios seja sempre um array
  const usuariosArray = Array.isArray(usuarios) ? usuarios : [];
  
  const stats = {
    total: usuariosArray.length,
    ativos: usuariosArray.filter(u => u.status === 'ativo').length,
    inativos: usuariosArray.filter(u => u.status === 'inativo').length,
    administradores: usuariosArray.filter(u => u.role === 'administrador').length
  };

  const statCards = [
    {
      title: 'Total de Usuários',
      value: stats.total,
      icon: FaUsers,
      color: 'bg-blue-500',
      textColor: 'text-blue-500'
    },
    {
      title: 'Usuários Ativos',
      value: stats.ativos,
      icon: FaUserCheck,
      color: 'bg-green-500',
      textColor: 'text-green-500'
    },
    {
      title: 'Usuários Inativos',
      value: stats.inativos,
      icon: FaUserTimes,
      color: 'bg-red-500',
      textColor: 'text-red-500'
    },
    {
      title: 'Administradores',
      value: stats.administradores,
      icon: FaUserCog,
      color: 'bg-purple-500',
      textColor: 'text-purple-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statCards.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
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

export default UsuariosStats;
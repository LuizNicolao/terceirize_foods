import React from 'react';
import { FaUsers, FaUserCheck, FaUserTimes, FaUserClock } from 'react-icons/fa';

const UsuariosStats = ({ usuarios }) => {
  const stats = React.useMemo(() => {
    const total = usuarios.length;
    const ativos = usuarios.filter(u => u.status === 'ativo').length;
    const inativos = usuarios.filter(u => u.status === 'inativo').length;
    const admins = usuarios.filter(u => u.role === 'administrador').length;
    const gestores = usuarios.filter(u => u.role === 'gestor').length;
    const supervisores = usuarios.filter(u => u.role === 'supervisor').length;
    const compradores = usuarios.filter(u => u.role === 'comprador').length;

    return {
      total,
      ativos,
      inativos,
      admins,
      gestores,
      supervisores,
      compradores
    };
  }, [usuarios]);

  const statCards = [
    {
      title: 'Total de Usuários',
      value: stats.total,
      icon: <FaUsers className="text-blue-500" />,
      color: 'bg-blue-50 border-blue-200',
      textColor: 'text-blue-700'
    },
    {
      title: 'Usuários Ativos',
      value: stats.ativos,
      icon: <FaUserCheck className="text-green-500" />,
      color: 'bg-green-50 border-green-200',
      textColor: 'text-green-700'
    },
    {
      title: 'Usuários Inativos',
      value: stats.inativos,
      icon: <FaUserTimes className="text-red-500" />,
      color: 'bg-red-50 border-red-200',
      textColor: 'text-red-700'
    },
    {
      title: 'Administradores',
      value: stats.admins,
      icon: <FaUsers className="text-purple-500" />,
      color: 'bg-purple-50 border-purple-200',
      textColor: 'text-purple-700'
    },
    {
      title: 'Gestores',
      value: stats.gestores,
      icon: <FaUsers className="text-indigo-500" />,
      color: 'bg-indigo-50 border-indigo-200',
      textColor: 'text-indigo-700'
    },
    {
      title: 'Supervisores',
      value: stats.supervisores,
      icon: <FaUsers className="text-yellow-500" />,
      color: 'bg-yellow-50 border-yellow-200',
      textColor: 'text-yellow-700'
    },
    {
      title: 'Compradores',
      value: stats.compradores,
      icon: <FaUsers className="text-teal-500" />,
      color: 'bg-teal-50 border-teal-200',
      textColor: 'text-teal-700'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statCards.map((card, index) => (
        <div
          key={index}
          className={`p-4 rounded-lg border ${card.color} shadow-sm`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${card.textColor}`}>
                {card.title}
              </p>
              <p className={`text-2xl font-bold ${card.textColor}`}>
                {card.value}
              </p>
            </div>
            <div className="text-2xl">
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UsuariosStats;

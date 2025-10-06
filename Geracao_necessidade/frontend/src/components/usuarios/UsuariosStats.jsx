import React from 'react';
import { FaUsers, FaCheckCircle, FaClipboardList, FaUserShield, FaUserTie, FaUserMd } from 'react-icons/fa';
import StatCard from '../ui/StatCard';

const UsuariosStats = ({ usuarios = [] }) => {
  const stats = {
    total: usuarios.length,
    ativos: usuarios.filter(u => u.ativo).length,
    coordenadores: usuarios.filter(u => u.tipo_usuario === 'Coordenacao').length,
    supervisores: usuarios.filter(u => u.tipo_usuario === 'Supervisao').length,
    nutricionistas: usuarios.filter(u => u.tipo_usuario === 'Nutricionista').length,
    inativos: usuarios.filter(u => !u.ativo).length
  };

  const statsCards = [
    {
      title: 'Total de Usuários',
      value: stats.total,
      subtitle: 'Usuários cadastrados',
      icon: FaUsers,
      color: 'blue'
    },
    {
      title: 'Usuários Ativos',
      value: stats.ativos,
      subtitle: 'Usuários ativos no sistema',
      icon: FaCheckCircle,
      color: 'green'
    },
    {
      title: 'Coordenadores',
      value: stats.coordenadores,
      subtitle: 'Usuários coordenadores',
      icon: FaUserShield,
      color: 'purple'
    },
    {
      title: 'Supervisores',
      value: stats.supervisores,
      subtitle: 'Usuários supervisores',
      icon: FaUserTie,
      color: 'orange'
    },
    {
      title: 'Nutricionistas',
      value: stats.nutricionistas,
      subtitle: 'Usuários nutricionistas',
      icon: FaUserMd,
      color: 'green'
    },
    {
      title: 'Inativos',
      value: stats.inativos,
      subtitle: 'Usuários inativos',
      icon: FaUsers,
      color: 'red'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Estatísticas Principais */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Estatísticas de Usuários</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {statsCards.map((card, index) => (
            <StatCard
              key={index}
              title={card.title}
              value={card.value}
              subtitle={card.subtitle}
              icon={card.icon}
              color={card.color}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default UsuariosStats;

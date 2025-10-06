import React from 'react';
import { FaUsers, FaUser, FaUserShield, FaUserTie } from 'react-icons/fa';
import { StatCard } from '../ui';

const UsuariosStats = ({ estatisticas }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-6">
      <StatCard
        title="Total de Usuários"
        value={estatisticas.total_usuarios}
        icon={FaUsers}
        color="blue"
      />
      <StatCard
        title="Usuários Ativos"
        value={estatisticas.usuarios_ativos}
        icon={FaUser}
        color="green"
      />
      <StatCard
        title="Administradores"
        value={estatisticas.administradores}
        icon={FaUserShield}
        color="purple"
      />
      <StatCard
        title="Coordenadores"
        value={estatisticas.coordenadores}
        icon={FaUserTie}
        color="orange"
      />
    </div>
  );
};

export default UsuariosStats;

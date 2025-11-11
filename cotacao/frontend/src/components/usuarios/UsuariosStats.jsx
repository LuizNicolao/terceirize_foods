import React, { useMemo } from 'react';
import { FaUsers, FaUserCheck, FaUserShield, FaUserTie } from 'react-icons/fa';
import { StatCard } from '../ui';

const UsuariosStats = ({ usuarios = [] }) => {
  const estatisticas = useMemo(() => {
    const total = usuarios.length;
    const ativos = usuarios.filter(usuario => usuario.status === 'ativo').length;
    const administradores = usuarios.filter(usuario => usuario.role === 'administrador').length;
    const gestores = usuarios.filter(usuario => usuario.role === 'gestor').length;

    return {
      total,
      ativos,
      administradores,
      gestores
    };
  }, [usuarios]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-6">
      <StatCard
        title="Total de Usuários"
        value={estatisticas.total}
        icon={FaUsers}
        color="blue"
      />
      <StatCard
        title="Usuários Ativos"
        value={estatisticas.ativos}
        icon={FaUserCheck}
        color="green"
      />
      <StatCard
        title="Administradores"
        value={estatisticas.administradores}
        icon={FaUserShield}
        color="purple"
      />
      <StatCard
        title="Gestores"
        value={estatisticas.gestores}
        icon={FaUserTie}
        color="orange"
      />
    </div>
  );
};

export default UsuariosStats;

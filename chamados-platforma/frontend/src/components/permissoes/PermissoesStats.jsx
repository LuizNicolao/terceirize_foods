import React from 'react';
import { FaUsers, FaCheckCircle, FaUserShield } from 'react-icons/fa';
import { StatCard } from '../ui';

const PermissoesStats = ({ estatisticas }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mb-4 sm:mb-6">
      <StatCard
        title="Total de Usuários"
        value={estatisticas.total_usuarios}
        icon={FaUsers}
        color="blue"
      />
      <StatCard
        title="Usuários Ativos"
        value={estatisticas.usuarios_ativos}
        icon={FaCheckCircle}
        color="green"
      />
      <StatCard
        title="Com Permissões"
        value={estatisticas.usuarios_com_permissoes}
        icon={FaUserShield}
        color="purple"
      />
    </div>
  );
};

export default PermissoesStats;

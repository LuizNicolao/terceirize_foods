import React from 'react';
import { FaUsers, FaUserCheck, FaUmbrellaBeach, FaUserClock } from 'react-icons/fa';
import { StatCard } from '../ui';

const MotoristasStats = ({ estatisticas }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        title="Total de Motoristas"
        value={estatisticas.total_motoristas}
        icon={FaUsers}
        color="blue"
      />
      <StatCard
        title="Motoristas Ativos"
        value={estatisticas.motoristas_ativos}
        icon={FaUserCheck}
        color="green"
      />
      <StatCard
        title="Em Férias"
        value={estatisticas.em_ferias}
        icon={FaUmbrellaBeach}
        color="yellow"
      />
      <StatCard
        title="Em Licença"
        value={estatisticas.em_licenca}
        icon={FaUserClock}
        color="orange"
      />
    </div>
  );
};

export default MotoristasStats;

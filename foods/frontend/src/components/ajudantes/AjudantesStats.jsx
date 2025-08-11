import React from 'react';
import { StatCard } from '../ui';
import { FaUsers, FaUserCheck, FaUmbrellaBeach, FaUserClock } from 'react-icons/fa';

const AjudantesStats = ({ estatisticas }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total de Ajudantes"
        value={estatisticas.total_ajudantes}
        icon={FaUsers}
        color="blue"
      />
      <StatCard
        title="Ajudantes Ativos"
        value={estatisticas.ajudantes_ativos}
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

export default AjudantesStats;

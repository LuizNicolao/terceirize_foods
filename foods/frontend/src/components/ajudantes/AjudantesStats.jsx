import React from 'react';
import { FaUsers, FaUser, FaCalendarAlt, FaIdCard } from 'react-icons/fa';
import { StatCard } from '../ui';

const AjudantesStats = ({ estatisticas }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-6">
      <StatCard
        title="Total de Ajudantes"
        value={estatisticas.total_ajudantes}
        icon={FaUsers}
        color="blue"
      />
      <StatCard
        title="Ajudantes Ativos"
        value={estatisticas.ajudantes_ativos}
        icon={FaUser}
        color="green"
      />
      <StatCard
        title="Em Férias"
        value={estatisticas.em_ferias}
        icon={FaCalendarAlt}
        color="orange"
      />
      <StatCard
        title="Em Licença"
        value={estatisticas.em_licenca}
        icon={FaIdCard}
        color="purple"
      />
    </div>
  );
};

export default AjudantesStats;

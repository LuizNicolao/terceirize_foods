import React from 'react';
import { FaSchool, FaMapMarkerAlt, FaRoute, FaUsers } from 'react-icons/fa';
import { StatCard } from '../ui';

const UnidadesEscolaresStats = ({ estatisticas }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-6">
      <StatCard
        title="Total de Unidades"
        value={estatisticas?.total_unidades || 0}
        icon={FaSchool}
        color="blue"
      />
      <StatCard
        title="Unidades Ativas"
        value={estatisticas?.unidades_ativas || 0}
        icon={FaUsers}
        color="green"
      />
      <StatCard
        title="Total de Estados"
        value={estatisticas?.total_estados || 0}
        icon={FaMapMarkerAlt}
        color="purple"
      />
      <StatCard
        title="Total de Cidades"
        value={estatisticas?.total_cidades || 0}
        icon={FaRoute}
        color="orange"
      />
    </div>
  );
};

export default UnidadesEscolaresStats;

import React from 'react';
import { FaRuler, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { StatCard } from '../ui';

const UnidadesStats = ({ estatisticas }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mb-4 sm:mb-6">
      <StatCard
        title="Total de Unidades"
        value={estatisticas.total_unidades}
        icon={FaRuler}
        color="blue"
      />
      <StatCard
        title="Unidades Ativas"
        value={estatisticas.unidades_ativas}
        icon={FaCheckCircle}
        color="green"
      />
      <StatCard
        title="Unidades Inativas"
        value={estatisticas.unidades_inativas}
        icon={FaTimesCircle}
        color="red"
      />
    </div>
  );
};

export default UnidadesStats;

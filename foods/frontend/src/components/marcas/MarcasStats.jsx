import React from 'react';
import { FaTag, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { StatCard } from '../ui';

const MarcasStats = ({ estatisticas }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mb-4 sm:mb-6">
      <StatCard
        title="Total de Marcas"
        value={estatisticas.total_marcas}
        icon={FaTag}
        color="blue"
      />
      <StatCard
        title="Marcas Ativas"
        value={estatisticas.marcas_ativas}
        icon={FaCheckCircle}
        color="green"
      />
      <StatCard
        title="Marcas Inativas"
        value={estatisticas.marcas_inativas}
        icon={FaTimesCircle}
        color="red"
      />
    </div>
  );
};

export default MarcasStats;

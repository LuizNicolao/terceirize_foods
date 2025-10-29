import React from 'react';
import { FaLayerGroup, FaCheckCircle, FaTimesCircle, FaTags } from 'react-icons/fa';
import { StatCard } from '../ui';

const GruposStats = ({ estatisticas }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <StatCard
        title="Total de Grupos"
        value={estatisticas.total}
        icon={FaLayerGroup}
        color="blue"
      />
      <StatCard
        title="Grupos Ativos"
        value={estatisticas.ativos}
        icon={FaCheckCircle}
        color="green"
      />
      <StatCard
        title="Grupos Inativos"
        value={estatisticas.inativos}
        icon={FaTimesCircle}
        color="red"
      />
      <StatCard
        title="Total de Subgrupos"
        value={estatisticas.subgrupos_total || 0}
        icon={FaTags}
        color="purple"
      />
    </div>
  );
};

export default GruposStats;

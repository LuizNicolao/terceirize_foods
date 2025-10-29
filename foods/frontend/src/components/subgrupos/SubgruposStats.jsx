import React from 'react';
import { StatCard } from '../ui';
import { FaBox, FaCheckCircle, FaTimesCircle, FaTags } from 'react-icons/fa';

const SubgruposStats = ({ estatisticas }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <StatCard
        title="Total de Subgrupos"
        value={estatisticas.total}
        icon={FaBox}
        color="blue"
      />
      <StatCard
        title="Subgrupos Ativos"
        value={estatisticas.ativos}
        icon={FaCheckCircle}
        color="green"
      />
      <StatCard
        title="Subgrupos Inativos"
        value={estatisticas.inativos}
        icon={FaTimesCircle}
        color="red"
      />
      <StatCard
        title="Total de Produtos"
        value={estatisticas.produtos_total || 0}
        icon={FaTags}
        color="purple"
      />
    </div>
  );
};

export default SubgruposStats;

import React from 'react';
import { StatCard } from '../ui';
import { FaBox, FaCheckCircle, FaTimesCircle, FaTags } from 'react-icons/fa';

const SubgruposStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <StatCard
        title="Total de Subgrupos"
        value={stats?.total || 0}
        icon={FaBox}
        color="blue"
      />
      <StatCard
        title="Subgrupos Ativos"
        value={stats?.ativos || 0}
        icon={FaCheckCircle}
        color="green"
      />
      <StatCard
        title="Subgrupos Inativos"
        value={stats?.inativos || 0}
        icon={FaTimesCircle}
        color="red"
      />
      <StatCard
        title="Total de Produtos"
        value={stats?.total_produtos || 0}
        icon={FaTags}
        color="purple"
      />
    </div>
  );
};

export default SubgruposStats;

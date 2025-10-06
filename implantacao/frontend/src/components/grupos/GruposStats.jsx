import React from 'react';
import { FaLayerGroup, FaCheckCircle, FaTimesCircle, FaTags } from 'react-icons/fa';
import { StatCard } from '../ui';

const GruposStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <StatCard
        title="Total de Grupos"
        value={stats?.total || 0}
        icon={FaLayerGroup}
        color="blue"
      />
      <StatCard
        title="Grupos Ativos"
        value={stats?.ativos || 0}
        icon={FaCheckCircle}
        color="green"
      />
      <StatCard
        title="Grupos Inativos"
        value={stats?.inativos || 0}
        icon={FaTimesCircle}
        color="red"
      />
      <StatCard
        title="Total de Subgrupos"
        value={stats?.total_subgrupos || 0}
        icon={FaTags}
        color="purple"
      />
    </div>
  );
};

export default GruposStats;

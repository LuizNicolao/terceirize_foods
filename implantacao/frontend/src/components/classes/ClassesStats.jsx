import React from 'react';
import { StatCard } from '../ui';
import { FaGraduationCap, FaCheckCircle, FaTimesCircle, FaTags } from 'react-icons/fa';

const ClassesStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <StatCard
        title="Total de Classes"
        value={stats?.total || 0}
        icon={FaGraduationCap}
        color="blue"
      />
      <StatCard
        title="Classes Ativas"
        value={stats?.ativos || 0}
        icon={FaCheckCircle}
        color="green"
      />
      <StatCard
        title="Classes Inativas"
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

export default ClassesStats;

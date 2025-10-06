import React from 'react';
import { FaRuler, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { StatCard } from '../ui';

const UnidadesMedidaStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mb-4 sm:mb-6">
      <StatCard
        title="Total de Unidades"
        value={stats?.total || 0}
        icon={FaRuler}
        color="blue"
      />
      <StatCard
        title="Unidades Ativas"
        value={stats?.ativos || 0}
        icon={FaCheckCircle}
        color="green"
      />
      <StatCard
        title="Unidades Inativas"
        value={stats?.inativos || 0}
        icon={FaTimesCircle}
        color="red"
      />
    </div>
  );
};

export default UnidadesMedidaStats;

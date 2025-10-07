import React from 'react';
import { FaBox, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { StatCard } from '../ui';

const ProdutosOrigemStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <StatCard
        title="Total de Produtos"
        value={stats?.total || 0}
        icon={FaBox}
        color="blue"
      />
      <StatCard
        title="Produtos Ativos"
        value={stats?.ativos || 0}
        icon={FaCheckCircle}
        color="green"
      />
      <StatCard
        title="Produtos Inativos"
        value={stats?.inativos || 0}
        icon={FaTimesCircle}
        color="red"
      />
    </div>
  );
};

export default ProdutosOrigemStats;
import React from 'react';
import { FaBox, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import StatCard from '../ui/StatCard';

const ProdutosPerCapitaStats = ({ pagination = {} }) => {
  const stats = {
    total: pagination.totalItems || 0,
    ativos: pagination.totalAtivos || 0,
    inativos: pagination.totalInativos || 0
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <StatCard
        title="Total de Produtos"
        value={stats.total}
        icon={FaBox}
        color="blue"
      />
      <StatCard
        title="Produtos Ativos"
        value={stats.ativos}
        icon={FaCheckCircle}
        color="green"
      />
      <StatCard
        title="Produtos Inativos"
        value={stats.inativos}
        icon={FaTimesCircle}
        color="red"
      />
    </div>
  );
};

export default ProdutosPerCapitaStats;

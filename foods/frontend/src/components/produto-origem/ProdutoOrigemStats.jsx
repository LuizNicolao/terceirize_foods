import React from 'react';
import { FaBox, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { StatCard } from '../ui';

const ProdutoOrigemStats = ({ estatisticas }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <StatCard
        title="Total de Produtos"
        value={estatisticas?.total || 0}
        icon={FaBox}
        color="blue"
      />
      <StatCard
        title="Produtos Ativos"
        value={estatisticas?.ativos || 0}
        icon={FaCheckCircle}
        color="green"
      />
      <StatCard
        title="Produtos Inativos"
        value={estatisticas?.inativos || 0}
        icon={FaTimesCircle}
        color="red"
      />
    </div>
  );
};

export default ProdutoOrigemStats;

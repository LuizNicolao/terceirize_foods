import React from 'react';
import { FaBox, FaCheckCircle, FaTimesCircle, FaTags } from 'react-icons/fa';
import { StatCard } from '../ui';

const ProdutosStats = ({ estatisticas }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <StatCard
        title="Total de Produtos"
        value={estatisticas.total_produtos}
        icon={FaBox}
        color="blue"
      />
      <StatCard
        title="Produtos Ativos"
        value={estatisticas.produtos_ativos}
        icon={FaCheckCircle}
        color="green"
      />
      <StatCard
        title="Produtos Inativos"
        value={estatisticas.produtos_inativos}
        icon={FaTimesCircle}
        color="red"
      />
      <StatCard
        title="Grupos Diferentes"
        value={estatisticas.grupos_diferentes}
        icon={FaTags}
        color="purple"
      />
    </div>
  );
};

export default ProdutosStats;

import React from 'react';
import { StatCard } from '../ui';
import { FaTag, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const NomeGenericoProdutoStats = ({ estatisticas }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
      <StatCard
        title="Total de Nomes Genéricos"
        value={estatisticas.total_nomes_genericos}
        icon={FaTag}
        color="blue"
      />
      <StatCard
        title="Nomes Genéricos Ativos"
        value={estatisticas.nomes_genericos_ativos}
        icon={FaCheckCircle}
        color="green"
      />
      <StatCard
        title="Nomes Genéricos Inativos"
        value={estatisticas.nomes_genericos_inativas}
        icon={FaTimesCircle}
        color="red"
      />
    </div>
  );
};

export default NomeGenericoProdutoStats;

import React from 'react';
import { FaBox, FaCheckCircle, FaTimesCircle, FaLink } from 'react-icons/fa';
import { StatCard } from '../ui';

const NomesGenericosStats = ({ estatisticas }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-6">
      <StatCard
        title="Total de Nomes Genéricos"
        value={estatisticas.total_nomes_genericos || 0}
        icon={FaBox}
        color="blue"
      />
      <StatCard
        title="Nomes Ativos"
        value={estatisticas.nomes_genericos_ativos || 0}
        icon={FaCheckCircle}
        color="green"
      />
      <StatCard
        title="Nomes Inativos"
        value={estatisticas.nomes_genericos_inativos || 0}
        icon={FaTimesCircle}
        color="red"
      />
      <StatCard
        title="Com Produtos Vinculados"
        value={estatisticas.produtos_vinculados || 0}
        icon={FaLink}
        color="purple"
      />
    </div>
  );
};

export default NomesGenericosStats;

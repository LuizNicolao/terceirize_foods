import React from 'react';
import { FaDollarSign, FaCheckCircle, FaTimesCircle, FaBuilding } from 'react-icons/fa';
import { StatCard } from '../ui';

const CentrosCustoStats = ({ estatisticas }) => {
  if (!estatisticas) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <StatCard
        title="Total de Centros de Custo"
        value={estatisticas.total || 0}
        icon={FaDollarSign}
        color="blue"
      />
      <StatCard
        title="Centros de Custo Ativos"
        value={estatisticas.ativos || 0}
        icon={FaCheckCircle}
        color="green"
      />
      <StatCard
        title="Centros de Custo Inativos"
        value={estatisticas.inativos || 0}
        icon={FaTimesCircle}
        color="red"
      />
      <StatCard
        title="Filiais Vinculadas"
        value={estatisticas.filiais_vinculadas || 0}
        icon={FaBuilding}
        color="purple"
      />
    </div>
  );
};

export default CentrosCustoStats;


import React from 'react';
import { FaWarehouse, FaCheckCircle, FaTimesCircle, FaBuilding } from 'react-icons/fa';
import { StatCard } from '../ui';

const AlmoxarifadosStats = ({ estatisticas }) => {
  if (!estatisticas) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
      <StatCard
        title="Total de Almoxarifados"
        value={estatisticas.total || 0}
        icon={FaWarehouse}
        color="blue"
      />
      <StatCard
        title="Almoxarifados Ativos"
        value={estatisticas.ativos || 0}
        icon={FaCheckCircle}
        color="green"
      />
      <StatCard
        title="Almoxarifados Inativos"
        value={estatisticas.inativos || 0}
        icon={FaTimesCircle}
        color="red"
      />
    </div>
  );
};

export default AlmoxarifadosStats;


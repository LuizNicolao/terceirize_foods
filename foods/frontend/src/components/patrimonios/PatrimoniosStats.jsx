import React from 'react';
import { FaBuilding, FaCheckCircle, FaTools, FaExclamationTriangle } from 'react-icons/fa';
import { StatCard } from '../ui';

const PatrimoniosStats = ({ estatisticas }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-6">
      <StatCard
        title="Total de Patrimônios"
        value={estatisticas.total}
        icon={FaBuilding}
        color="blue"
      />
      <StatCard
        title="Patrimônios Ativos"
        value={estatisticas.ativos}
        icon={FaCheckCircle}
        color="green"
      />
      <StatCard
        title="Em Manutenção"
        value={estatisticas.manutencao}
        icon={FaTools}
        color="yellow"
      />
      <StatCard
        title="Obsoletos"
        value={estatisticas.obsoletos}
        icon={FaExclamationTriangle}
        color="red"
      />
    </div>
  );
};

export default PatrimoniosStats;

import React from 'react';
import { FaFileAlt, FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaDollarSign } from 'react-icons/fa';
import { StatCard } from '../ui';

const SolicitacoesComprasStats = ({ estatisticas }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <StatCard
        title="Total"
        value={estatisticas?.total || 0}
        icon={FaFileAlt}
        color="blue"
      />
      <StatCard
        title="Abertas"
        value={estatisticas?.abertos || 0}
        icon={FaFileAlt}
        color="blue"
      />
      <StatCard
        title="Parciais"
        value={estatisticas?.parciais || 0}
        icon={FaExclamationTriangle}
        color="yellow"
      />
      <StatCard
        title="Finalizadas"
        value={estatisticas?.finalizados || 0}
        icon={FaCheckCircle}
        color="green"
      />
      <StatCard
        title="Canceladas"
        value={estatisticas?.canceladas || 0}
        icon={FaTimesCircle}
        color="red"
      />
    </div>
  );
};

export default SolicitacoesComprasStats;


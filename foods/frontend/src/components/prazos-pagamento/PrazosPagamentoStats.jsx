import React from 'react';
import { FaCalendarAlt, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { StatCard } from '../ui';

const PrazosPagamentoStats = ({ estatisticas }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <StatCard
        title="Total de Prazos"
        value={estatisticas?.total || 0}
        icon={FaCalendarAlt}
        color="blue"
      />
      <StatCard
        title="Prazos Ativos"
        value={estatisticas?.ativos || 0}
        icon={FaCheckCircle}
        color="green"
      />
      <StatCard
        title="Prazos Inativos"
        value={estatisticas?.inativos || 0}
        icon={FaTimesCircle}
        color="red"
      />
    </div>
  );
};

export default PrazosPagamentoStats;


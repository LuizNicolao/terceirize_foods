import React from 'react';
import { FaCreditCard, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { StatCard } from '../ui';

const FormasPagamentoStats = ({ estatisticas }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <StatCard
        title="Total de Formas"
        value={estatisticas?.total || 0}
        icon={FaCreditCard}
        color="blue"
      />
      <StatCard
        title="Formas Ativas"
        value={estatisticas?.ativos || 0}
        icon={FaCheckCircle}
        color="green"
      />
      <StatCard
        title="Formas Inativas"
        value={estatisticas?.inativos || 0}
        icon={FaTimesCircle}
        color="red"
      />
    </div>
  );
};

export default FormasPagamentoStats;


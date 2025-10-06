import React from 'react';
import { FaClipboardList, FaClock, FaCheckCircle, FaTimesCircle, FaPlayCircle } from 'react-icons/fa';
import { StatCard } from '../ui';

const ReceitaStats = ({ estatisticas }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-6 mb-4 sm:mb-6">
      <StatCard
        title="Total de Cardápios"
        value={estatisticas.total_receitas || 0}
        icon={FaClipboardList}
        color="blue"
      />
      <StatCard
        title="Pendentes de Aprovação"
        value={estatisticas.receitas_pendentes || 0}
        icon={FaClock}
        color="yellow"
      />
      <StatCard
        title="Aprovados"
        value={estatisticas.receitas_aprovados || 0}
        icon={FaCheckCircle}
        color="green"
      />
      <StatCard
        title="Rejeitados"
        value={estatisticas.receitas_rejeitados || 0}
        icon={FaTimesCircle}
        color="red"
      />
      <StatCard
        title="Ativos"
        value={estatisticas.receitas_ativos || 0}
        icon={FaPlayCircle}
        color="purple"
      />
    </div>
  );
};

export default ReceitaStats;

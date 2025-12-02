import React from 'react';
import { FaClipboardCheck, FaCheckCircle, FaTimesCircle, FaPlus, FaRedo } from 'react-icons/fa';
import { StatCard } from '../ui';

const FichaHomologacaoStats = ({ estatisticas }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-6 mb-4 sm:mb-6">
      <StatCard
        title="Total de Fichas"
        value={estatisticas.total || 0}
        icon={FaClipboardCheck}
        color="blue"
      />
      <StatCard
        title="Fichas Ativas"
        value={estatisticas.ativas || 0}
        icon={FaCheckCircle}
        color="green"
      />
      <StatCard
        title="Fichas Inativas"
        value={estatisticas.inativas || 0}
        icon={FaTimesCircle}
        color="red"
      />
      <StatCard
        title="Novos Produtos"
        value={estatisticas.novos_produtos || 0}
        icon={FaPlus}
        color="purple"
      />
      <StatCard
        title="Reavaliações"
        value={estatisticas.reavaliacoes || 0}
        icon={FaRedo}
        color="orange"
      />
    </div>
  );
};

export default FichaHomologacaoStats;


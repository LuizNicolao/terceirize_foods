import React from 'react';
import { FaClipboardList, FaClock, FaCheckCircle, FaTimesCircle, FaPlayCircle } from 'react-icons/fa';
import { StatCard } from '../ui';

const NecessidadeStats = ({ estatisticas }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-6 mb-4 sm:mb-6">
      <StatCard
        title="Total de Necessidades"
        value={estatisticas.total_necessidades || 0}
        icon={FaClipboardList}
        color="blue"
        className="col-span-2 lg:col-span-1"
      />
      <StatCard
        title="Pendentes"
        value={estatisticas.necessidades_pendentes || 0}
        icon={FaClock}
        color="yellow"
        className="col-span-2 lg:col-span-1"
      />
      <StatCard
        title="Aprovadas"
        value={estatisticas.necessidades_aprovadas || 0}
        icon={FaCheckCircle}
        color="green"
        className="col-span-2 lg:col-span-1"
      />
      <StatCard
        title="Rejeitadas"
        value={estatisticas.necessidades_rejeitadas || 0}
        icon={FaTimesCircle}
        color="red"
        className="col-span-2 lg:col-span-1"
      />
      <StatCard
        title="Ativas"
        value={estatisticas.necessidades_ativas || 0}
        icon={FaPlayCircle}
        color="purple"
        className="col-span-2 lg:col-span-1"
      />
    </div>
  );
};

export default NecessidadeStats;

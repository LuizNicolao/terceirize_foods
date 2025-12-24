import React from 'react';
import { FaBug, FaClipboardList, FaCog, FaCheckCircle } from 'react-icons/fa';
import { StatCard } from '../ui';

const ChamadosStats = ({ estatisticas }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-6">
      <StatCard
        title="Total de Chamados"
        value={estatisticas.total_chamados}
        icon={FaClipboardList}
        color="blue"
      />
      <StatCard
        title="Chamados Abertos"
        value={estatisticas.chamados_abertos}
        icon={FaBug}
        color="yellow"
      />
      <StatCard
        title="Em Andamento"
        value={estatisticas.chamados_em_andamento}
        icon={FaCog}
        color="purple"
      />
      <StatCard
        title="Concluídos"
        value={estatisticas.chamados_concluidos}
        icon={FaCheckCircle}
        color="green"
      />
    </div>
  );
};

export default ChamadosStats;

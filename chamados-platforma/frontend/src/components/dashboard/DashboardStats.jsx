import React from 'react';
import { FaClipboardList, FaBug, FaCog, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { StatCard } from '../ui';

const DashboardStats = ({ estatisticas }) => {
  if (!estatisticas?.resumo) return null;

  const { resumo } = estatisticas;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-6 mb-6">
      <StatCard
        title="Total de Chamados"
        value={resumo.total || 0}
        icon={FaClipboardList}
        color="blue"
      />
      <StatCard
        title="Chamados Abertos"
        value={resumo.abertos || 0}
        icon={FaBug}
        color="yellow"
      />
      <StatCard
        title="Em Andamento"
        value={resumo.em_andamento || 0}
        icon={FaCog}
        color="purple"
      />
      <StatCard
        title="Concluídos"
        value={resumo.concluidos || 0}
        icon={FaCheckCircle}
        color="green"
      />
      <StatCard
        title="Críticos Abertos"
        value={resumo.criticos_abertos || 0}
        icon={FaExclamationTriangle}
        color="red"
      />
    </div>
  );
};

export default DashboardStats;


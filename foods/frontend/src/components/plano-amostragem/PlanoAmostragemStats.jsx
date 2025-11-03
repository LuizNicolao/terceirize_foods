import React from 'react';
import { FaClipboardCheck, FaCheckCircle, FaLayerGroup, FaList } from 'react-icons/fa';
import { StatCard } from '../ui';

const PlanoAmostragemStats = ({ estatisticas = {} }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <StatCard
        title="Total de NQAs"
        value={estatisticas.total_nqas || 0}
        icon={FaClipboardCheck}
        color="blue"
      />
      <StatCard
        title="NQAs Ativos"
        value={estatisticas.nqas_ativos || 0}
        icon={FaCheckCircle}
        color="green"
      />
      <StatCard
        title="Total de Faixas"
        value={estatisticas.total_faixas || 0}
        icon={FaList}
        color="purple"
      />
      <StatCard
        title="Grupos Vinculados"
        value={estatisticas.total_grupos || 0}
        icon={FaLayerGroup}
        color="orange"
      />
    </div>
  );
};

export default PlanoAmostragemStats;


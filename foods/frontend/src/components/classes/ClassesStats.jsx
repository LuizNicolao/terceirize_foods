import React from 'react';
import { StatCard } from '../ui';
import { FaGraduationCap, FaCheckCircle, FaTimesCircle, FaTags } from 'react-icons/fa';

const ClassesStats = ({ estatisticas }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <StatCard
        title="Total de Classes"
        value={estatisticas.total_classes}
        icon={FaGraduationCap}
        color="blue"
      />
      <StatCard
        title="Classes Ativas"
        value={estatisticas.classes_ativas}
        icon={FaCheckCircle}
        color="green"
      />
      <StatCard
        title="Classes Inativas"
        value={estatisticas.classes_inativas}
        icon={FaTimesCircle}
        color="red"
      />
      <StatCard
        title="Total de Produtos"
        value={estatisticas.produtos_total}
        icon={FaTags}
        color="purple"
      />
    </div>
  );
};

export default ClassesStats;

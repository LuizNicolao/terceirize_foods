import React from 'react';
import { FaSchool, FaCalendarDay, FaChartLine } from 'react-icons/fa';
import StatCard from '../ui/StatCard';

const MediasEscolasStats = ({ escolas, registros, medias }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      <StatCard
        title="Total de Escolas"
        value={escolas?.length || 0}
        icon={FaSchool}
        color="blue"
      />
      <StatCard
        title="Registros Diários"
        value={registros?.length || 0}
        icon={FaCalendarDay}
        color="green"
      />
      <StatCard
        title="Médias Calculadas"
        value={medias?.length || 0}
        icon={FaChartLine}
        color="purple"
      />
    </div>
  );
};

export default MediasEscolasStats;

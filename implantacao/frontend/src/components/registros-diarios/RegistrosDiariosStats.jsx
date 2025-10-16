import React from 'react';
import { FaCalendarCheck, FaSchool, FaCalendarAlt, FaChartLine } from 'react-icons/fa';
import { StatCard } from '../ui';

const RegistrosDiariosStats = ({ estatisticas }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-6">
      <StatCard
        title="Total de Registros"
        value={estatisticas?.total_registros || 0}
        icon={FaCalendarCheck}
        color="blue"
      />
      <StatCard
        title="Escolas Registradas"
        value={estatisticas?.total_escolas || 0}
        icon={FaSchool}
        color="green"
      />
      <StatCard
        title="Registros Mês Atual"
        value={estatisticas?.registros_mes_atual || 0}
        icon={FaCalendarAlt}
        color="purple"
      />
      <StatCard
        title="Médias Calculadas"
        value={estatisticas?.total_medias || 0}
        icon={FaChartLine}
        color="orange"
      />
    </div>
  );
};

export default RegistrosDiariosStats;


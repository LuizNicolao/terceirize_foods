import React from 'react';
import { FaFileInvoice, FaCalendarAlt, FaSchool, FaChartLine } from 'react-icons/fa';
import { StatCard } from '../ui';

const FaturamentoStats = ({ estatisticas }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-6">
      <StatCard
        title="Total de Faturamentos"
        value={estatisticas.total_faturamentos || 0}
        icon={FaFileInvoice}
        color="green"
      />
      <StatCard
        title="Este Mês"
        value={estatisticas.faturamentos_mes_atual || 0}
        icon={FaCalendarAlt}
        color="green"
      />
      <StatCard
        title="Este Ano"
        value={estatisticas.faturamentos_ano_atual || 0}
        icon={FaChartLine}
        color="purple"
      />
      <StatCard
        title="Unidades Ativas"
        value={estatisticas.unidades_ativas || 0}
        icon={FaSchool}
        color="orange"
      />
    </div>
  );
};

export default FaturamentoStats;

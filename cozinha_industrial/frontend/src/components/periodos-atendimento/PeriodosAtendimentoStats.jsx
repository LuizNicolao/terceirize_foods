import React from 'react';
import { FaClock, FaCheckCircle, FaTimesCircle, FaSchool } from 'react-icons/fa';
import { StatCard } from '../ui';

/**
 * Componente de estatísticas para Períodos de Atendimento
 */
const PeriodosAtendimentoStats = ({ periodosAtendimento = [] }) => {
  const total = periodosAtendimento.length;
  const ativos = periodosAtendimento.filter(p => p.status === 'ativo').length;
  const inativos = periodosAtendimento.filter(p => p.status === 'inativo').length;
  const totalUnidades = periodosAtendimento.reduce((acc, p) => acc + (p.total_unidades_vinculadas || 0), 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <StatCard
        title="Total"
        value={total}
        icon={FaClock}
        color="blue"
      />
      <StatCard
        title="Ativos"
        value={ativos}
        icon={FaCheckCircle}
        color="green"
      />
      <StatCard
        title="Inativos"
        value={inativos}
        icon={FaTimesCircle}
        color="red"
      />
      <StatCard
        title="Unidades Vinculadas"
        value={totalUnidades}
        icon={FaSchool}
        color="purple"
      />
    </div>
  );
};

export default PeriodosAtendimentoStats;


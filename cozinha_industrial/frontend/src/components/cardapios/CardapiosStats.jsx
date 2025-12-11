import React from 'react';
import { FaClipboardList, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { StatCard } from '../ui';

/**
 * Componente de estatísticas para Cardápios
 */
const CardapiosStats = ({ cardapios = [] }) => {
  const total = cardapios.length;
  const ativos = cardapios.filter(c => c.status === 'ativo').length;
  const inativos = cardapios.filter(c => c.status === 'inativo').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <StatCard
        title="Total"
        value={total}
        icon={FaClipboardList}
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
    </div>
  );
};

export default CardapiosStats;


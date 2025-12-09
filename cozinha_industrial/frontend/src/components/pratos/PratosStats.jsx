import React from 'react';
import { FaList, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { StatCard } from '../ui';

/**
 * Componente de estatísticas para Pratos
 */
const PratosStats = ({ pratos = [] }) => {
  const total = pratos.length;
  const ativos = pratos.filter(p => p.status === 1 || p.status === true).length;
  const inativos = pratos.filter(p => p.status === 0 || p.status === false).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <StatCard
        title="Total"
        value={total}
        icon={FaList}
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

export default PratosStats;


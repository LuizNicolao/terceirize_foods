import React from 'react';
import { FaList, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { StatCard } from '../ui';

/**
 * Componente de estatísticas para Tipos de Pratos
 */
const TiposPratosStats = ({ tiposPratos = [] }) => {
  const total = tiposPratos.length;
  const ativos = tiposPratos.filter(t => t.status === 1 || t.status === true).length;
  const inativos = tiposPratos.filter(t => t.status === 0 || t.status === false).length;

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

export default TiposPratosStats;


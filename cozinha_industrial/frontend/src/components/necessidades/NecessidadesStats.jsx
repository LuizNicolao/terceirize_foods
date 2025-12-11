import React from 'react';
import { FaClipboardList, FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa';
import { StatCard } from '../ui';

/**
 * Componente de estatísticas para Necessidades
 */
const NecessidadesStats = ({ necessidades = [] }) => {
  const total = necessidades.length;
  const geradas = necessidades.filter(n => n.status === 'gerada').length;
  const pendentes = necessidades.filter(n => n.status === 'pendente').length;
  const canceladas = necessidades.filter(n => n.status === 'cancelada').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <StatCard
        title="Total"
        value={total}
        icon={FaClipboardList}
        color="blue"
      />
      <StatCard
        title="Geradas"
        value={geradas}
        icon={FaCheckCircle}
        color="green"
      />
      <StatCard
        title="Pendentes"
        value={pendentes}
        icon={FaClock}
        color="yellow"
      />
      <StatCard
        title="Canceladas"
        value={canceladas}
        icon={FaTimesCircle}
        color="red"
      />
    </div>
  );
};

export default NecessidadesStats;

import React from 'react';
import { FaRoute, FaMapMarkedAlt, FaTruck, FaMoneyBillWave } from 'react-icons/fa';
import { StatCard } from '../ui';

const RotasStats = ({ estatisticas, formatCurrency }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-6">
      <StatCard
        title="Total de Rotas"
        value={estatisticas.total_rotas}
        icon={FaRoute}
        color="blue"
      />
      <StatCard
        title="Rotas Ativas"
        value={estatisticas.rotas_ativas}
        icon={FaMapMarkedAlt}
        color="green"
      />
      <StatCard
        title="Distância Total"
        value={`${(estatisticas.distancia_total || 0).toFixed(1)} km`}
        icon={FaTruck}
        color="purple"
      />
      <StatCard
        title="Custo Total Diário"
        value={formatCurrency(estatisticas.custo_total_diario || 0)}
        icon={FaMoneyBillWave}
        color="orange"
      />
    </div>
  );
};

export default RotasStats;

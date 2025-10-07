import React from 'react';
import { FaRoute, FaMapMarkedAlt, FaBuilding, FaChartBar } from 'react-icons/fa';
import { StatCard } from '../ui';

const RotasStats = ({ estatisticas }) => {
  // Garantir que estatisticas seja um objeto válido
  const safeEstatisticas = estatisticas || {};

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-6">
      <StatCard
        title="Total de Rotas"
        value={safeEstatisticas.total_rotas || 0}
        icon={FaRoute}
        color="blue"
      />
      <StatCard
        title="Rotas Ativas"
        value={safeEstatisticas.rotas_ativas || 0}
        icon={FaMapMarkedAlt}
        color="green"
      />
      <StatCard
        title="Rotas por Filial"
        value={safeEstatisticas.total_filiais || 0}
        icon={FaBuilding}
        color="purple"
      />
      <StatCard
        title="Tipos de Rota"
        value={`${safeEstatisticas.rotas_semanais || 0}S / ${safeEstatisticas.rotas_mensais || 0}M`}
        icon={FaChartBar}
        color="orange"
      />
    </div>
  );
};

export default RotasStats;

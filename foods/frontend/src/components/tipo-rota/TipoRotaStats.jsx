import React from 'react';
import { FaRoute, FaMapMarkedAlt, FaBuilding, FaLayerGroup } from 'react-icons/fa';
import { StatCard } from '../ui';

const TipoRotaStats = ({ estatisticas }) => {
  const safeEstatisticas = estatisticas || {};

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-6">
      <StatCard
        title="Total de Tipos de Rota"
        value={safeEstatisticas.total_tipo_rotas || 0}
        icon={FaRoute}
        color="blue"
      />
      <StatCard
        title="Tipos de Rota Ativos"
        value={safeEstatisticas.tipo_rotas_ativas || 0}
        icon={FaMapMarkedAlt}
        color="green"
      />
      <StatCard
        title="Filiais"
        value={safeEstatisticas.total_filiais || 0}
        icon={FaBuilding}
        color="purple"
      />
      <StatCard
        title="Grupos"
        value={safeEstatisticas.total_grupos || 0}
        icon={FaLayerGroup}
        color="orange"
      />
    </div>
  );
};

export default TipoRotaStats;


import React from 'react';
import { FaRoute, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { StatCard } from '../ui';

const RotasNutricionistasStats = ({ stats = {} }) => {
  const totalRotas = stats.total || 0;
  const rotasAtivas = stats.ativos || 0;
  const rotasInativas = stats.inativos || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
      <StatCard
        title="Total de Rotas"
        value={totalRotas}
        icon={FaRoute}
        color="blue"
        description="Total de rotas cadastradas"
      />
      <StatCard
        title="Rotas Ativas"
        value={rotasAtivas}
        icon={FaCheckCircle}
        color="green"
        description="Rotas em atividade"
      />
      <StatCard
        title="Rotas Inativas"
        value={rotasInativas}
        icon={FaTimesCircle}
        color="red"
        description="Rotas desativadas"
      />
    </div>
  );
};

export default RotasNutricionistasStats;

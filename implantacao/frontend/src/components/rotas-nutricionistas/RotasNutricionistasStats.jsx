import React from 'react';
import { FaBuilding, FaSchool } from 'react-icons/fa';
import { StatCard } from '../ui';

const RotasNutricionistasStats = ({ rotasNutricionistas = [], unidadesEscolares = [] }) => {
  const totalRotas = rotasNutricionistas?.length || 0;
  const rotasAtivas = rotasNutricionistas?.filter(rota => rota.status === 'ativo' || rota.status === 1)?.length || 0;
  const rotasInativas = rotasNutricionistas?.filter(rota => rota.status === 'inativo' || rota.status === 0)?.length || 0;
  const totalUnidadesEscolares = unidadesEscolares?.length || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <StatCard
        title="Total de Rotas"
        value={totalRotas}
        icon={FaBuilding}
        color="blue"
      />
      <StatCard
        title="Rotas Ativas"
        value={rotasAtivas}
        icon={FaBuilding}
        color="green"
      />
      <StatCard
        title="Rotas Inativas"
        value={rotasInativas}
        icon={FaBuilding}
        color="red"
      />
      <StatCard
        title="Unidades Escolares"
        value={totalUnidadesEscolares}
        icon={FaSchool}
        color="orange"
      />
    </div>
  );
};

export default RotasNutricionistasStats;

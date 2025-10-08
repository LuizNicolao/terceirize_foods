import React from 'react';
import { FaBuilding, FaSchool } from 'react-icons/fa';
import { StatCard } from '../ui';

const RotasNutricionistasStats = ({ rotasNutricionistas = [], unidadesEscolares = [] }) => {
  // Garantir que rotasNutricionistas seja sempre um array
  const rotasArray = Array.isArray(rotasNutricionistas) ? rotasNutricionistas : [];
  const escolasArray = Array.isArray(unidadesEscolares) ? unidadesEscolares : [];
  
  const totalRotas = rotasArray.length;
  const rotasAtivas = rotasArray.filter(rota => rota.status === 'ativo' || rota.status === 1).length;
  const rotasInativas = rotasArray.filter(rota => rota.status === 'inativo' || rota.status === 0).length;
  const totalUnidadesEscolares = escolasArray.length;

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

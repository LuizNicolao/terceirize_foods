import React from 'react';
import { FaTruck, FaCar, FaMotorcycle, FaTools } from 'react-icons/fa';
import { StatCard } from '../ui';

const VeiculosStats = ({ estatisticas }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-6">
      <StatCard
        title="Total de Veículos"
        value={estatisticas.total_veiculos}
        icon={FaTruck}
        color="blue"
      />
      <StatCard
        title="Veículos Ativos"
        value={estatisticas.veiculos_ativos}
        icon={FaCar}
        color="green"
      />
      <StatCard
        title="Em Manutenção"
        value={estatisticas.em_manutencao}
        icon={FaTools}
        color="yellow"
      />
      <StatCard
        title="Tipos de Veículo"
        value={estatisticas.total_tipos}
        icon={FaMotorcycle}
        color="purple"
      />
    </div>
  );
};

export default VeiculosStats;

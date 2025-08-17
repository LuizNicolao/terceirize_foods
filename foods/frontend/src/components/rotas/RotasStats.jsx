import React from 'react';
import { FaRoute, FaMapMarkedAlt, FaTruck, FaMoneyBillWave } from 'react-icons/fa';
import { StatCard } from '../ui';

const RotasStats = ({ estatisticas, formatCurrency }) => {
  // Debug: verificar se os valores estão chegando
  console.log('RotasStats - estatisticas:', estatisticas);
  console.log('RotasStats - formatCurrency:', formatCurrency);

  // Garantir que formatCurrency seja uma função
  const safeFormatCurrency = (value) => {
    if (typeof formatCurrency === 'function') {
      return formatCurrency(value);
    }
    // Fallback se formatCurrency não for uma função
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

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
        title="Distância Total"
        value={`${(safeEstatisticas.distancia_total || 0).toFixed(1)} km`}
        icon={FaTruck}
        color="purple"
      />
      <StatCard
        title="Custo Total Diário"
        value={safeFormatCurrency(safeEstatisticas.custo_total_diario || 0)}
        icon={FaMoneyBillWave}
        color="orange"
      />
    </div>
  );
};

export default RotasStats;

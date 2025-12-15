import React from 'react';
import { FaUtensils, FaSchool, FaBox } from 'react-icons/fa';
import { StatCard } from '../ui';

/**
 * Componente de estatísticas para Tipos de Cardápio
 */
const TiposCardapioStats = ({ tiposCardapio = [] }) => {
  const total = tiposCardapio.length;
  const totalUnidades = tiposCardapio.reduce((acc, tc) => acc + (tc.total_unidades_vinculadas || 0), 0);
  const totalProdutos = tiposCardapio.reduce((acc, tc) => acc + (tc.total_produtos_vinculados || 0), 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <StatCard
        title="Total"
        value={total}
        icon={FaUtensils}
        color="blue"
      />
      <StatCard
        title="Unidades Vinculadas"
        value={totalUnidades}
        icon={FaSchool}
        color="purple"
      />
      <StatCard
        title="Produtos Vinculados"
        value={totalProdutos}
        icon={FaBox}
        color="orange"
      />
    </div>
  );
};

export default TiposCardapioStats;


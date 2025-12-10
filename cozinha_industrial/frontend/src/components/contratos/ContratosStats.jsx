import React from 'react';
import { FaFileContract, FaCheckCircle, FaTimesCircle, FaSchool, FaBox } from 'react-icons/fa';
import { StatCard } from '../ui';

/**
 * Componente de estatísticas para Contratos
 */
const ContratosStats = ({ contratos = [] }) => {
  const total = contratos.length;
  const ativos = contratos.filter(c => c.status === 'ativo').length;
  const inativos = contratos.filter(c => c.status === 'inativo').length;
  const totalUnidades = contratos.reduce((acc, c) => acc + (c.total_unidades_vinculadas || 0), 0);
  const totalProdutos = contratos.reduce((acc, c) => acc + (c.total_produtos_vinculados || 0), 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
      <StatCard
        title="Total"
        value={total}
        icon={FaFileContract}
        color="blue"
      />
      <StatCard
        title="Ativos"
        value={ativos}
        icon={FaCheckCircle}
        color="green"
      />
      <StatCard
        title="Inativos"
        value={inativos}
        icon={FaTimesCircle}
        color="red"
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

export default ContratosStats;


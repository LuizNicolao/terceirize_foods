import React from 'react';
import { FaTruck, FaCheckCircle, FaClock, FaExclamationTriangle } from 'react-icons/fa';
import { StatCard } from '../ui';

const RecebimentosStats = ({ recebimentos = [], estatisticas = {} }) => {
  // Calcular estatísticas baseadas nos recebimentos
  const totalRecebimentos = recebimentos.length;
  const recebimentosCompletos = recebimentos.filter(r => r.tipo_recebimento === 'Completo').length;
  const recebimentosPendentes = recebimentos.filter(r => r.status_entrega === 'Atrasado').length;
  const totalProdutos = recebimentos.reduce((total, r) => total + (r.produtos?.length || 0), 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <StatCard
        title="Total de Recebimentos"
        value={totalRecebimentos}
        icon={FaTruck}
        color="blue"
      />
      <StatCard
        title="Recebimentos Completos"
        value={recebimentosCompletos}
        icon={FaCheckCircle}
        color="green"
      />
      <StatCard
        title="Recebimentos Pendentes"
        value={recebimentosPendentes}
        icon={FaClock}
        color="yellow"
      />
      <StatCard
        title="Total de Produtos"
        value={totalProdutos}
        icon={FaExclamationTriangle}
        color="purple"
      />
    </div>
  );
};

export default RecebimentosStats;
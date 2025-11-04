import React from 'react';
import { FaShoppingCart, FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa';
import { StatCard } from '../ui';

const PedidosComprasStats = ({ estatisticas }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <StatCard
        title="Total de Pedidos"
        value={estatisticas?.total || 0}
        icon={FaShoppingCart}
        color="blue"
      />
      <StatCard
        title="Em Digitação"
        value={estatisticas?.em_digitacao || 0}
        icon={FaClock}
        color="yellow"
      />
      <StatCard
        title="Aprovados"
        value={estatisticas?.aprovado || 0}
        icon={FaCheckCircle}
        color="green"
      />
      <StatCard
        title="Cancelados"
        value={estatisticas?.cancelado || 0}
        icon={FaTimesCircle}
        color="red"
      />
    </div>
  );
};

export default PedidosComprasStats;


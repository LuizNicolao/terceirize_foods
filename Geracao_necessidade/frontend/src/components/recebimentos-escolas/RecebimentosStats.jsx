import React from 'react';
import { FaTruck, FaClock, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import StatCard from '../ui/StatCard';

const RecebimentosStats = ({ recebimentos = [], pagination = {} }) => {
  // Usar estatísticas do backend (totais gerais) em vez de calcular baseado na página atual
  const stats = {
    total: pagination.totalItems || 0,
    noPrazo: pagination.noPrazo || 0,
    atrasado: pagination.atrasado || 0,
    antecipado: pagination.antecipado || 0
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        title="Total de Recebimentos"
        value={stats.total}
        icon={FaTruck}
        color="blue"
      />
      <StatCard
        title="No Prazo"
        value={stats.noPrazo}
        icon={FaCheckCircle}
        color="green"
      />
      <StatCard
        title="Atrasados"
        value={stats.atrasado}
        icon={FaExclamationTriangle}
        color="red"
      />
      <StatCard
        title="Antecipados"
        value={stats.antecipado}
        icon={FaClock}
        color="yellow"
      />
    </div>
  );
};

export default RecebimentosStats;

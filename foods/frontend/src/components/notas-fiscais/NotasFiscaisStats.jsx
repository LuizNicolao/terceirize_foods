import React from 'react';
import { FaFileInvoice, FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { StatCard } from '../ui';

const NotasFiscaisStats = ({ estatisticas }) => {
  if (!estatisticas) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <StatCard
        title="Total de Notas Fiscais"
        value={estatisticas.total || 0}
        icon={FaFileInvoice}
        color="blue"
      />
      <StatCard
        title="Lançadas"
        value={estatisticas.lancadas || 0}
        icon={FaCheckCircle}
        color="green"
      />
    </div>
  );
};

export default NotasFiscaisStats;


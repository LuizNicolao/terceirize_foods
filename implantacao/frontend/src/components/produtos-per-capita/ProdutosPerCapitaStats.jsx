import React from 'react';
import { FaBox, FaCheckCircle, FaTimesCircle, FaChartLine } from 'react-icons/fa';
import { StatCard } from '../ui';

/**
 * Componente de estatísticas para Produtos Per Capita
 * Segue padrão de excelência do sistema
 */
const ProdutosPerCapitaStats = ({ estatisticas = {}, loading = false }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const stats = {
    total: estatisticas.total_produtos || 0,
    ativos: estatisticas.produtos_ativos || 0,
    inativos: estatisticas.produtos_inativos || 0,
    unicos: estatisticas.produtos_unicos || 0
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        title="Total de Produtos"
        value={stats.total}
        icon={FaBox}
        color="blue"
        loading={loading}
      />
      <StatCard
        title="Produtos Ativos"
        value={stats.ativos}
        icon={FaCheckCircle}
        color="green"
        loading={loading}
      />
      <StatCard
        title="Produtos Inativos"
        value={stats.inativos}
        icon={FaTimesCircle}
        color="red"
        loading={loading}
      />
      <StatCard
        title="Produtos Únicos"
        value={stats.unicos}
        icon={FaChartLine}
        color="purple"
        loading={loading}
      />
    </div>
  );
};

export default ProdutosPerCapitaStats;

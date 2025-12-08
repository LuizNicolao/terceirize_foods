import React from 'react';
import { FaBook, FaBox } from 'react-icons/fa';
import { StatCard } from '../ui';

/**
 * Componente de estatísticas para Receitas
 */
const ReceitasStats = ({ stats = {}, loading = false }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {[...Array(2)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
      <StatCard
        title="Total de Receitas"
        value={stats.total || 0}
        icon={FaBook}
        color="blue"
        loading={loading}
      />
      <StatCard
        title="Total de Produtos"
        value={stats.total_produtos || 0}
        icon={FaBox}
        color="green"
        loading={loading}
      />
    </div>
  );
};

export default ReceitasStats;


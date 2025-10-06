import React from 'react';
import { FaClipboardList, FaBox, FaSchool, FaCalendarAlt } from 'react-icons/fa';
import StatCard from '../ui/StatCard';

const NecessidadesStats = ({ 
  produtos = [], 
  escola = null, 
  grupo = null, 
  data = null 
}) => {
  const stats = {
    totalProdutos: produtos.length,
    produtosComAjuste: produtos.filter(p => Number(p.ajuste) > 0).length,
    totalAjustado: produtos.reduce((sum, p) => sum + Number(p.ajuste || 0), 0)
  };

  const statsCards = [
    {
      title: 'Total de Produtos',
      value: stats.totalProdutos,
      subtitle: 'Produtos disponíveis',
      icon: FaBox,
      color: 'blue'
    },
    {
      title: 'Com Ajuste',
      value: stats.produtosComAjuste,
      subtitle: 'Produtos com ajuste definido',
      icon: FaClipboardList,
      color: 'orange'
    },
    {
      title: 'Total Ajustado',
      value: Number(stats.totalAjustado).toFixed(3),
      subtitle: 'Soma dos ajustes finais',
      icon: FaClipboardList,
      color: 'green'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Estatísticas Principais */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Estatísticas da Necessidade</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {statsCards.map((card, index) => (
            <StatCard
              key={index}
              title={card.title}
              value={card.value}
              subtitle={card.subtitle}
              icon={card.icon}
              color={card.color}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default NecessidadesStats;

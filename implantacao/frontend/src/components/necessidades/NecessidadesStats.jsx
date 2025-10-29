import React from 'react';
import { FaClipboardList, FaBox, FaSchool, FaCalendarAlt } from 'react-icons/fa';
import { StatCard } from '../ui';

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
      title: 'Produtos',
      value: stats.totalProdutos,
      icon: FaBox,
      color: 'blue'
    },
    {
      title: 'Com Ajuste',
      value: stats.produtosComAjuste,
      icon: FaClipboardList,
      color: 'orange'
    },
    {
      title: 'Total Ajustado',
      value: Number(stats.totalAjustado).toFixed(3),
      icon: FaClipboardList,
      color: 'green'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Estatísticas Principais */}
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {statsCards.map((card, index) => (
            <StatCard
              key={index}
              title={card.title}
              value={card.value}
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

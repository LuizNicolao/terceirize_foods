import React from 'react';
import { useNavigate } from 'react-router-dom';
import { StatCard } from '../ui';

const DashboardAlertCards = ({ statsData = {} }) => {
  const navigate = useNavigate();
  
  // Garantir que statsData seja sempre um objeto
  const safeStatsData = statsData && typeof statsData === 'object' ? statsData : {};

  const alertCards = [
    {
      title: "Produtos Sem Estoque",
      value: safeStatsData.produtosSemEstoque || 0,
      subtitle: "Produtos que precisam de reposição",
      color: "red",
      path: "/foods/produtos?status=sem_estoque"
    },
    {
      title: "Produtos Vencendo",
      value: safeStatsData.produtosVencendo || 0,
      subtitle: "Produtos próximos do vencimento",
      color: "orange",
      path: "/foods/produtos?status=vencendo"
    },
    {
      title: "Documentações Vencendo",
      value: (safeStatsData.veiculosDocumentacaoVencendo || 0) + (safeStatsData.motoristasCnhVencendo || 0),
      subtitle: "Veículos e motoristas com docs vencendo",
      color: "yellow",
      path: "/foods/veiculos?status=documentacao_vencendo"
    },
    {
      title: "Valor do Estoque",
      value: safeStatsData.valorEstoque ? `R$ ${safeStatsData.valorEstoque.toLocaleString('pt-BR')}` : 'R$ 0,00',
      subtitle: "Valor total em estoque",
      color: "green",
      path: "/foods/produtos"
    }
  ];

  const handleCardClick = (path) => {
    if (path) {
      navigate(path);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {alertCards.map((card, index) => (
        <div
          key={index}
          className={`bg-${card.color}-50 border border-${card.color}-200 rounded-lg p-4 cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-1`}
          onClick={() => handleCardClick(card.path)}
        >
          <h4 className={`text-sm font-medium text-${card.color}-800 mb-2`}>
            {card.title}
          </h4>
          <p className={`text-2xl font-bold text-${card.color}-600`}>
            {card.value}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            {card.subtitle}
          </p>
        </div>
      ))}
    </div>
  );
};

export default DashboardAlertCards;

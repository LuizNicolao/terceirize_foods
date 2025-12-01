import React from 'react';
import { FaBoxes, FaCheckCircle, FaBan, FaTimesCircle, FaDollarSign, FaExclamationTriangle } from 'react-icons/fa';
import { StatCard } from '../ui';

const EstoqueStats = ({ estatisticas = {} }) => {
  // O backend retorna: { total, ativos, bloqueados, inativos, valor_total_estoque, produtos_abaixo_minimo }
  // Pode estar em estatisticas.geral ou diretamente em estatisticas
  const stats = estatisticas.geral || estatisticas || {};

  // Card principais (sempre visíveis)
  // O backend retorna: total, ativos, bloqueados, inativos
  const mainCards = [
    {
      title: 'Total de Estoques',
      value: Number(stats.total_estoques ?? stats.total ?? 0),
      icon: FaBoxes,
      color: 'blue'
    },
    {
      title: 'Estoques Ativos',
      value: Number(stats.estoques_ativos ?? stats.ativos ?? 0),
      icon: FaCheckCircle,
      color: 'green'
    },
    {
      title: 'Estoques Bloqueados',
      value: Number(stats.estoques_bloqueados ?? stats.bloqueados ?? 0),
      icon: FaBan,
      color: 'yellow'
    },
    {
      title: 'Estoques Inativos',
      value: Number(stats.estoques_inativos ?? stats.inativos ?? 0),
      icon: FaTimesCircle,
      color: 'red'
    }
  ];

  // Cards adicionais (condicionais)
  const additionalCards = [];

  if (stats.valor_total_estoque !== undefined && stats.valor_total_estoque !== null && stats.valor_total_estoque > 0) {
    additionalCards.push({
      title: 'Valor Total do Estoque',
      value: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(stats.valor_total_estoque || 0),
      icon: FaDollarSign,
      color: 'green'
    });
  }

  if (stats.produtos_abaixo_minimo !== undefined && stats.produtos_abaixo_minimo !== null && stats.produtos_abaixo_minimo > 0) {
    additionalCards.push({
      title: 'Produtos Abaixo do Mínimo',
      value: stats.produtos_abaixo_minimo || 0,
      icon: FaExclamationTriangle,
      color: 'orange'
    });
  }

  const allCards = [...mainCards, ...additionalCards];
  const gridCols = allCards.length > 4 ? 'lg:grid-cols-5' : 'lg:grid-cols-4';

  return (
    <div className={`grid grid-cols-2 ${gridCols} gap-3 sm:gap-6 mb-4 sm:mb-6`}>
      {allCards.map((card, index) => (
        <StatCard
          key={index}
          title={card.title}
          value={card.value}
          icon={card.icon}
          color={card.color}
        />
      ))}
    </div>
  );
};

export default EstoqueStats;


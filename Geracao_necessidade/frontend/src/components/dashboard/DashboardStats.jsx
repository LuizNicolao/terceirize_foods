import React from 'react';
import { FaSchool, FaBox, FaClipboardList, FaTruck, FaCalendarDay, FaUsers, FaRoute, FaChartLine } from 'react-icons/fa';
import StatCard from '../ui/StatCard';

/**
 * Componente de estatísticas do dashboard
 */
const DashboardStats = ({ statsData, onCardClick, loading = false }) => {
  // Configuração dos cards principais
  const statsCards = [
    {
      title: 'Escolas',
      value: statsData.totalEscolas || 0,
      subtitle: 'Total de escolas cadastradas',
      icon: FaSchool,
      color: 'blue',
      route: '/escolas'
    },
    {
      title: 'Produtos',
      value: statsData.totalProdutos || 0,
      subtitle: 'Produtos disponíveis',
      icon: FaBox,
      color: 'green',
      route: '/produtos'
    },
    {
      title: 'Necessidades',
      value: statsData.totalNecessidades || 0,
      subtitle: 'Necessidades registradas',
      icon: FaClipboardList,
      color: 'purple',
      route: '/necessidades'
    },
    {
      title: 'Recebimentos',
      value: statsData.totalRecebimentos || 0,
      subtitle: 'Recebimentos realizados',
      icon: FaTruck,
      color: 'orange',
      route: '/recebimentos-escolas'
    },
    {
      title: 'Registros Diários',
      value: statsData.totalRegistrosDiarios || 0,
      subtitle: 'Registros do dia',
      icon: FaCalendarDay,
      color: 'red',
      route: '/registros-diarios'
    },
    {
      title: 'Usuários',
      value: statsData.totalUsuarios || 0,
      subtitle: 'Usuários ativos',
      icon: FaUsers,
      color: 'yellow',
      route: '/usuarios'
    }
  ];

  // Configuração dos cards de alertas
  const alertCards = [
    {
      title: 'Pendentes',
      value: statsData.necessidadesPendentes || 0,
      subtitle: 'Necessidades pendentes',
      icon: FaClipboardList,
      color: 'red',
      route: '/necessidades?status=pendente'
    },
    {
      title: 'Alertas',
      value: statsData.alertasUrgentes || 0,
      subtitle: 'Alertas urgentes',
      icon: FaChartLine,
      color: 'orange',
      route: '/dashboard/alertas'
    }
  ];

  // Handler para clique nos cards
  const handleCardClick = (route) => {
    if (onCardClick && route) {
      onCardClick(route);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas Principais */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Estatísticas Gerais</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {statsCards.map((card, index) => (
            <StatCard
              key={`stats-${index}`}
              title={card.title}
              value={card.value}
              subtitle={card.subtitle}
              icon={card.icon}
              color={card.color}
              onClick={() => handleCardClick(card.route)}
              loading={loading}
            />
          ))}
        </div>
      </div>

      {/* Alertas e Pendências */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Alertas e Pendências</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {alertCards.map((card, index) => (
            <StatCard
              key={`alert-${index}`}
              title={card.title}
              value={card.value}
              subtitle={card.subtitle}
              icon={card.icon}
              color={card.color}
              onClick={() => handleCardClick(card.route)}
              loading={loading}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;

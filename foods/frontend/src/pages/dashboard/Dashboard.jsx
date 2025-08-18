import React from 'react';
import { FaUsers, FaTruck, FaBox, FaLayerGroup, FaChartLine, FaExclamationTriangle, FaDollarSign, FaRuler, FaBuilding, FaRoute } from 'react-icons/fa';
import { useDashboard } from '../../hooks/useDashboard';
import { DashboardStats } from './components/DashboardStats';
import { DashboardActivities } from './components/DashboardActivities';
import { DashboardAlerts } from './components/DashboardAlerts';
import { DashboardMetrics } from './components/DashboardMetrics';
import { DashboardQuickLinks } from './components/DashboardQuickLinks';
import { LoadingSpinner } from '../../components/LoadingSpinner';

const Dashboard = () => {
  const {
    loading,
    dashboardData,
    atividades,
    alertas,
    statsData,
    formatCurrency,
    formatDate
  } = useDashboard();

  if (loading) {
    return <LoadingSpinner message="Carregando dashboard..." />;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600">
          Visão geral do sistema de terceirização de alimentos
        </p>
      </div>

      {/* Cards de Estatísticas */}
      <DashboardStats statsData={statsData} />

      {/* Conteúdo Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gráficos e Métricas */}
        <div className="lg:col-span-2 space-y-6">
          {/* Atividades Recentes */}
          <DashboardActivities 
            atividades={atividades} 
            formatDate={formatDate} 
          />

          {/* Métricas de Performance */}
          <DashboardMetrics 
            statsData={statsData} 
            formatCurrency={formatCurrency} 
          />
        </div>

        {/* Sidebar - Alertas e Informações */}
        <div className="space-y-6">
          {/* Alertas */}
          <DashboardAlerts 
            alertas={alertas} 
            formatDate={formatDate} 
          />

          {/* Links Rápidos */}
          <DashboardQuickLinks />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

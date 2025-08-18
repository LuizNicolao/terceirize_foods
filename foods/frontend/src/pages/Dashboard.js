import React from 'react';
import { useDashboard } from '../hooks/useDashboard';
import {
  DashboardLayout,
  DashboardLoading,
  DashboardStats,
  DashboardActivities,
  DashboardMetrics,
  DashboardAlerts,
  DashboardSystemInfo,
  DashboardQuickAccess
} from '../components/dashboard';

const Dashboard = () => {
  const {
    loading,
    statsData,
    atividades,
    alertas
  } = useDashboard();

  if (loading) {
    return <DashboardLoading />;
  }

  return (
    <DashboardLayout>
      {/* Cards de Estatísticas */}
      <DashboardStats statsData={statsData} />

      {/* Conteúdo Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gráficos e Métricas */}
        <div className="lg:col-span-2 space-y-6">
          {/* Atividades Recentes */}
          <DashboardActivities atividades={atividades} />

          {/* Métricas de Performance */}
          <DashboardMetrics statsData={statsData} />
        </div>

        {/* Sidebar - Alertas e Informações */}
        <div className="space-y-6">
          {/* Alertas */}
          <DashboardAlerts alertas={alertas} />

          {/* Informações do Sistema */}
          <DashboardSystemInfo statsData={statsData} />

          {/* Links Rápidos */}
          <DashboardQuickAccess />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard; 
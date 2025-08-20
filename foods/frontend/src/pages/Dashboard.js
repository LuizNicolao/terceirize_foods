import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../hooks/useDashboard';
import {
  DashboardLayout,
  DashboardLoading,
  DashboardStats,
  DashboardActivities,
  DashboardMetrics,
  DashboardAlerts,
  DashboardSystemInfo,
  DashboardFilters
} from '../components/dashboard';

const Dashboard = () => {
  const navigate = useNavigate();
  const {
    loading,
    statsData,
    atividades,
    alertas,
    loadDashboardData
  } = useDashboard();

  const handleCardClick = (route) => {
    if (route) {
      navigate(route);
    }
  };

  const handleNavigate = (route) => {
    navigate(route);
  };

  const handleFilterChange = (filters) => {
    // Aqui você pode implementar a lógica de filtros
    console.log('Filtros aplicados:', filters);
  };

  const handleRefresh = () => {
    loadDashboardData();
  };

  if (loading) {
    return <DashboardLoading />;
  }

  return (
    <DashboardLayout>
      {/* Filtros Rápidos */}
      <DashboardFilters 
        onFilterChange={handleFilterChange}
        onRefresh={handleRefresh}
      />

      {/* Cards de Estatísticas Organizados por Categoria */}
      <DashboardStats 
        statsData={statsData} 
        onCardClick={handleCardClick}
      />

      {/* Conteúdo Principal - Layout Responsivo Melhorado */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6 mt-6 md:mt-8">
        {/* Área Principal - Gráficos e Métricas */}
        <div className="lg:col-span-3 space-y-4 md:space-y-6">
          {/* Atividades Recentes */}
          <DashboardActivities atividades={atividades} />

          {/* Métricas de Performance */}
          <DashboardMetrics statsData={statsData} />
        </div>

        {/* Sidebar - Alertas e Informações */}
        <div className="space-y-4 md:space-y-6">
          {/* Alertas Interativos */}
          <DashboardAlerts 
            alertas={alertas} 
            onNavigate={handleNavigate}
          />

          {/* Informações do Sistema */}
          <DashboardSystemInfo statsData={statsData} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard; 
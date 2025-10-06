import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useDashboard } from '../../hooks/useDashboard';
import {
  DashboardLayout,
  DashboardLoading,
  DashboardStats,
  DashboardAlerts
} from '../../components/dashboard';

/**
 * Página principal do Dashboard
 */
const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    loading,
    error,
    statsData,
    alertas,
    loadDashboardData,
    refreshStats,
    refreshAlertas
  } = useDashboard();

  /**
   * Handler para clique nos cards de estatísticas
   */
  const handleCardClick = (route) => {
    if (route) {
      navigate(route);
    }
  };

  /**
   * Handler para navegação via alertas
   */
  const handleNavigate = (route) => {
    navigate(route);
  };

  /**
   * Handler para refresh completo
   */
  const handleRefresh = () => {
    loadDashboardData();
  };

  /**
   * Handler para refresh apenas das estatísticas
   */
  const handleRefreshStats = () => {
    refreshStats();
  };

  /**
   * Handler para refresh apenas dos alertas
   */
  const handleRefreshAlertas = () => {
    refreshAlertas();
  };

  // Loading state
  if (loading) {
    return <DashboardLoading />;
  }

  // Error state
  if (error) {
    return (
      <DashboardLayout>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Erro ao carregar dashboard
              </h3>
              <div className="mt-2 text-sm text-red-700">
                {error}
              </div>
              <div className="mt-4">
                <button
                  onClick={handleRefresh}
                  className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Tentar novamente
                </button>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header com informações do usuário */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Bem-vindo, {user?.nome || 'Usuário'}!
        </h1>
        <p className="text-gray-600 mt-1">
          Aqui está um resumo do sistema de geração de necessidades
        </p>
      </div>

      {/* Estatísticas */}
      <DashboardStats 
        statsData={statsData} 
        onCardClick={handleCardClick}
        loading={loading}
      />

      {/* Alertas */}
      <div className="mt-6 md:mt-8">
        <DashboardAlerts 
          alertas={alertas} 
          onNavigate={handleNavigate}
          loading={loading}
        />
      </div>

      {/* Botões de ação (opcional) */}
      <div className="mt-6 flex justify-end space-x-3">
        <button
          onClick={handleRefreshStats}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
        >
          Atualizar Estatísticas
        </button>
        <button
          onClick={handleRefreshAlertas}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
        >
          Atualizar Alertas
        </button>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;

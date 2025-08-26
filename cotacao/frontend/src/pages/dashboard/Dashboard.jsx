import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useDashboard } from '../../hooks/useDashboard';
import { 
  DashboardStats, 
  DashboardActivity, 
  DashboardChart,
  DashboardAlerts,
  DashboardRecent
} from './components';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { 
    dashboardData, 
    loading, 
    error, 
    formatCurrency, 
    getActivityIcon,
    getStatusLabel,
    getStatusColor,
    formatDate
  } = useDashboard();

  const handleViewCotacao = (cotacaoId) => {
    navigate(`/visualizar-cotacao/${cotacaoId}`);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-3 text-gray-600">Carregando dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12 bg-red-50 text-red-700 rounded-lg">
          <div className="text-center">
            <div className="text-2xl mb-2">⚠️</div>
            <h3 className="text-lg font-semibold mb-2">Erro ao carregar dados</h3>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Bem-vindo, {user?.name || 'Usuário'}! Aqui está um resumo das atividades do sistema de cotação.
        </p>
      </div>

      {/* Alertas */}
      <DashboardAlerts alerts={dashboardData?.alerts?.alertas} />

      {/* Stats */}
      <DashboardStats 
        stats={dashboardData?.stats} 
        formatCurrency={formatCurrency} 
      />

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2">
          <DashboardChart />
        </div>
        <div className="lg:col-span-1">
          <DashboardActivity 
            recentActivity={dashboardData?.recentActivity} 
            getActivityIcon={getActivityIcon} 
          />
        </div>
      </div>

      {/* Cotações Recentes */}
      <div className="mt-6">
        <DashboardRecent 
          recent={dashboardData?.recent}
          getStatusLabel={getStatusLabel}
          getStatusColor={getStatusColor}
          formatDate={formatDate}
          onViewCotacao={handleViewCotacao}
        />
      </div>
    </div>
  );
};

export default Dashboard;

import React from 'react';
import Layout from '../../components/Layout';
import { useDashboard } from '../../hooks/useDashboard';
import { DashboardStats, RecentActivity, DashboardCharts } from './components';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const Dashboard = () => {
  const {
    dashboardData,
    loading,
    error,
    user,
    formatCurrency,
    getActivityIcon,
    getActivityColor
  } = useDashboard();

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-red-800">
              <strong>Erro:</strong> {error}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600">
            Bem-vindo, {user?.name || 'Usuário'}! Aqui está um resumo das atividades do sistema de cotação.
          </p>
        </div>

        {/* Stats Cards */}
        <DashboardStats 
          stats={dashboardData?.stats} 
          formatCurrency={formatCurrency} 
        />

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Charts */}
          <div className="lg:col-span-2">
            <DashboardCharts />
          </div>

          {/* Recent Activity */}
          <div>
            <RecentActivity 
              activities={dashboardData?.recentActivity}
              getActivityIcon={getActivityIcon}
              getActivityColor={getActivityColor}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;

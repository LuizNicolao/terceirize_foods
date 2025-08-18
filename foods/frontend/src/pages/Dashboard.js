import React from 'react';
import { useDashboard } from '../hooks/useDashboard';
import { prepareStatsData } from '../utils/dashboardUtils';
import { 
  DashboardStats, 
  DashboardActivities, 
  DashboardAlerts,
  DashboardAlertCards
} from '../components/dashboard';
import { ChartCard } from '../components/ui';

const Dashboard = () => {
  const { loading, dashboardData, atividades, alertas } = useDashboard();
  
  // Preparar dados de estatísticas com verificação de segurança
  const statsData = React.useMemo(() => {
    try {
      return prepareStatsData(dashboardData || {});
    } catch (error) {
      console.error('Erro ao preparar dados de estatísticas:', error);
      return {
        totalUsuarios: 0,
        totalVeiculos: 0,
        totalProdutos: 0,
        totalGrupos: 0,
        totalFiliais: 0,
        totalRotas: 0,
        totalMotoristas: 0,
        totalUnidadesEscolares: 0,
        totalFornecedores: 0,
        totalClientes: 0,
        totalSubgrupos: 0,
        totalClasses: 0,
        totalMarcas: 0,
        totalUnidades: 0,
        totalAjudantes: 0,
        valorEstoque: 0,
        produtosEstoqueBaixo: 0,
        produtosSemEstoque: 0,
        produtosVencendo: 0,
        veiculosDocumentacaoVencendo: 0,
        motoristasCnhVencendo: 0
      };
    }
  }, [dashboardData]);

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
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

      {/* Cards de Alertas */}
      <DashboardAlertCards statsData={statsData} />

      {/* Grid de Conteúdo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Atividades Recentes */}
        <DashboardActivities atividades={atividades} />
        
        {/* Alertas */}
        <DashboardAlerts alertas={alertas} />
      </div>

      {/* Gráficos e Estatísticas Avançadas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Valor do Estoque"
          value={statsData.valorEstoque}
          subtitle="Valor total em estoque"
          type="currency"
          color="bg-green-500"
        />
        
        <ChartCard
          title="Produtos com Estoque Baixo"
          value={statsData.produtosEstoqueBaixo}
          subtitle="Produtos que precisam de reposição"
          type="number"
          color="bg-yellow-500"
        />
      </div>
    </div>
  );
};

export default Dashboard; 
import { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboard';

export const useDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Buscar todos os dados da API
      const [stats, recent, alerts, recentActivity] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getRecent(),
        dashboardService.getAlerts(),
        dashboardService.getActivity()
      ]);
      
      setDashboardData({
        stats,
        recent,
        alerts,
        recentActivity
      });
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      setError(error.message);
      
      // Fallback para dados mockados em caso de erro
      const mockData = {
        stats: {
          totalCotacoes: 0,
          pendentes: 0,
          aprovadas: 0,
          rejeitadas: 0,
          renegociacao: 0,
          em_analise: 0,
          programadas: 0,
          emergenciais: 0,
          usuariosAtivos: 0,
          economia_total: 0,
          economia_percentual: 0,
          total_negociado: 0,
          total_aprovado: 0
        },
        recent: {
          recentes: [],
          total: 0
        },
        alerts: {
          alertas: [],
          total: 0
        },
        recentActivity: []
      };
      setDashboardData(mockData);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'cotacao_aprovada':
        return 'check-circle';
      case 'nova_cotacao':
        return 'truck';
      case 'cotacao_rejeitada':
        return 'times-circle';
      case 'supervisor_review':
        return 'exclamation-triangle';
      default:
        return 'chart-line';
    }
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      'pendente': 'Pendente',
      'aguardando_aprovacao': 'Aguardando Aprovação',
      'aguardando_aprovacao_supervisor': 'Aguardando Supervisor',
      'aprovada': 'Aprovada',
      'rejeitada': 'Rejeitada',
      'renegociacao': 'Em Renegociação',
      'em_analise': 'Em Análise'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'pendente': 'bg-yellow-100 text-yellow-800',
      'aguardando_aprovacao': 'bg-orange-100 text-orange-800',
      'aguardando_aprovacao_supervisor': 'bg-purple-100 text-purple-800',
      'aprovada': 'bg-green-100 text-green-800',
      'rejeitada': 'bg-red-100 text-red-800',
      'renegociacao': 'bg-blue-100 text-blue-800',
      'em_analise': 'bg-indigo-100 text-indigo-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return {
    dashboardData,
    loading,
    error,
    loadDashboardData,
    formatCurrency,
    getActivityIcon,
    getStatusLabel,
    getStatusColor,
    formatDate
  };
};

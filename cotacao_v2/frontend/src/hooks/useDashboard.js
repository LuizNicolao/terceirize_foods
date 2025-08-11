import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { dashboardService } from '../services/dashboard';

export const useDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carregar dados do dashboard
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await dashboardService.getDashboardStats();
      
      if (result.success) {
        setDashboardData({
          stats: result.data.stats,
          recentActivity: result.data.recentActivity || []
        });
      } else {
        setError(result.error || 'Erro ao carregar dados do dashboard');
        // Fallback para dados mockados
        setDashboardData({
          stats: {
            totalCotacoes: 0,
            cotacoesPendentes: 0,
            cotacoesAprovadas: 0,
            cotacoesRejeitadas: 0,
            totalEconomia: 0,
            usuariosAtivos: 0
          },
          recentActivity: []
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      setError('Erro ao conectar com o servidor');
      // Fallback para dados mockados
      setDashboardData({
        stats: {
          totalCotacoes: 0,
          cotacoesPendentes: 0,
          cotacoesAprovadas: 0,
          cotacoesRejeitadas: 0,
          totalEconomia: 0,
          usuariosAtivos: 0
        },
        recentActivity: []
      });
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados quando o componente montar
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Funções utilitárias
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getActivityIcon = (type) => {
    const iconMap = {
      'cotacao_aprovada': 'FaCheckCircle',
      'nova_cotacao': 'FaTruck',
      'cotacao_rejeitada': 'FaTimesCircle',
      'supervisor_review': 'FaExclamationTriangle',
      'default': 'FaChartLine'
    };
    return iconMap[type] || iconMap.default;
  };

  const getActivityColor = (type) => {
    const colorMap = {
      'cotacao_aprovada': '#10B981',
      'nova_cotacao': '#3B82F6',
      'cotacao_rejeitada': '#EF4444',
      'supervisor_review': '#F59E0B',
      'default': '#6B7280'
    };
    return colorMap[type] || colorMap.default;
  };

  return {
    // Estados
    dashboardData,
    loading,
    error,
    user,
    
    // Funções
    loadDashboardData,
    formatCurrency,
    getActivityIcon,
    getActivityColor
  };
};

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import DashboardService from '../services/dashboard';

export const useDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({});
  const [alertas, setAlertas] = useState([]);
  const [dadosRecentes, setDadosRecentes] = useState({});
  const [error, setError] = useState(null);

  /**
   * Carregar dados do dashboard
   */
  const loadDashboardData = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      // Carregar dados em paralelo para melhor performance
      const [statsResult, recentesResult, alertasResult] = await Promise.all([
        DashboardService.carregarEstatisticas(filters),
        DashboardService.carregarDadosRecentes(),
        DashboardService.carregarAlertas()
      ]);

      // Processar estatísticas
      if (statsResult.success) {
        setDashboardData(statsResult.data);
      } else {
        setError(statsResult.error);
        toast.error(statsResult.error);
      }

      // Processar dados recentes
      if (recentesResult.success) {
        setDadosRecentes(recentesResult.data);
      }

      // Processar alertas
      if (alertasResult.success) {
        setAlertas(alertasResult.data);
      }

    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      const errorMessage = 'Erro ao carregar dados do dashboard';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Recarregar dados específicos
   */
  const refreshStats = useCallback(async () => {
    try {
      const result = await DashboardService.carregarEstatisticas();
      if (result.success) {
        setDashboardData(result.data);
      }
    } catch (error) {
      console.error('Erro ao recarregar estatísticas:', error);
    }
  }, []);

  const refreshAlertas = useCallback(async () => {
    try {
      const result = await DashboardService.carregarAlertas();
      if (result.success) {
        setAlertas(result.data);
      }
    } catch (error) {
      console.error('Erro ao recarregar alertas:', error);
    }
  }, []);

  // Carregar dados iniciais
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Dados de estatísticas formatados
  const statsData = {
    totalEscolas: dashboardData.escolas || 0,
    totalProdutos: dashboardData.produtos || 0,
    totalNecessidades: dashboardData.necessidades || 0,
    totalRecebimentos: dashboardData.recebimentos || 0,
    totalRegistrosDiarios: dashboardData.registros_diarios || 0,
    totalUsuarios: dashboardData.usuarios || 0,
    totalTiposEntrega: dashboardData.tipos_entrega || 0,
    totalProdutosPerCapita: dashboardData.produtos_per_capita || 0,
    totalMediasEscolas: dashboardData.medias_escolas || 0,
    necessidadesPendentes: dashboardData.necessidades_pendentes || 0,
    recebimentosPendentes: dashboardData.recebimentos_pendentes || 0,
    registrosPendentes: dashboardData.registros_pendentes || 0,
    alertasUrgentes: dashboardData.alertas_urgentes || 0
  };

  return {
    // Estados
    loading,
    error,
    dashboardData,
    alertas,
    dadosRecentes,
    statsData,
    
    // Ações
    loadDashboardData,
    refreshStats,
    refreshAlertas
  };
};

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import DashboardService from '../services/dashboard';

export const useDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({});
  const [atividades, setAtividades] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [dadosRecentes, setDadosRecentes] = useState({});

  // Carregar dados do dashboard
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Carregar dados principais (estatísticas)
      const result = await DashboardService.carregarEstatisticas();
      if (result.success) {
        setDashboardData(result.data || {});
      } else {
        toast.error(result.error || 'Erro ao carregar estatísticas');
      }

      // Carregar atividades recentes
      const atividadesResult = await DashboardService.carregarAtividadesRecentes(5);
      if (atividadesResult.success) {
        setAtividades(Array.isArray(atividadesResult.data) ? atividadesResult.data : []);
      } else {
        setAtividades([]);
      }

      // Carregar dados recentes
      const recentesResult = await DashboardService.carregarDadosRecentes();
      if (recentesResult.success) {
        setDadosRecentes(recentesResult.data || {});
      } else {
        setDadosRecentes({});
      }

      // Carregar alertas
      const alertasResult = await DashboardService.carregarAlertas();
      if (alertasResult.success) {
        setAlertas(Array.isArray(alertasResult.data) ? alertasResult.data : []);
      } else {
        setAlertas([]);
      }

    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      toast.error('Erro ao carregar dados do dashboard');
      // Garantir que os estados sejam arrays vazios em caso de erro
      setAtividades([]);
      setAlertas([]);
      setDashboardData({});
      setDadosRecentes({});
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    loadDashboardData();
  }, []);

  return {
    loading,
    dashboardData,
    atividades,
    alertas,
    dadosRecentes,
    loadDashboardData
  };
};

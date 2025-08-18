import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import DashboardService from '../services/dashboard';

export const useDashboard = () => {
  // Estados
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({});
  const [atividades, setAtividades] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [dadosRecentes, setDadosRecentes] = useState({});

  // Carregar dados iniciais
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Carregar dados do dashboard
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Carregar dados principais (estatísticas)
      const result = await DashboardService.carregarEstatisticas();
      if (result.success) {
        setDashboardData(result.data);
      } else {
        toast.error(result.error);
      }

      // Carregar atividades recentes
      const atividadesResult = await DashboardService.carregarAtividadesRecentes(5);
      if (atividadesResult.success) {
        setAtividades(atividadesResult.data);
      }

      // Carregar dados recentes
      const recentesResult = await DashboardService.carregarDadosRecentes();
      if (recentesResult.success) {
        setDadosRecentes(recentesResult.data);
      }

      // Carregar alertas
      const alertasResult = await DashboardService.carregarAlertas();
      if (alertasResult.success) {
        setAlertas(alertasResult.data);
      }

    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Utilitários
  const formatCurrency = (value) => {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Hoje';
    if (diffDays === 2) return 'Ontem';
    if (diffDays <= 7) return `${diffDays - 1} dias atrás`;
    
    return date.toLocaleDateString('pt-BR');
  };

  // Dados de estatísticas do backend
  const statsData = {
    totalUsuarios: dashboardData.usuarios || 0,
    totalVeiculos: dashboardData.veiculos || 0,
    totalProdutos: dashboardData.produtos || 0,
    totalGrupos: dashboardData.grupos || 0,
    totalFiliais: dashboardData.filiais || 0,
    totalRotas: dashboardData.rotas || 0,
    totalMotoristas: dashboardData.motoristas || 0,
    totalUnidadesEscolares: dashboardData.unidades_escolares || 0,
    totalFornecedores: dashboardData.fornecedores || 0,
    totalClientes: dashboardData.clientes || 0,
    totalSubgrupos: dashboardData.subgrupos || 0,
    totalClasses: dashboardData.classes || 0,
    totalMarcas: dashboardData.marcas || 0,
    totalUnidades: dashboardData.unidades || 0,
    totalAjudantes: dashboardData.ajudantes || 0,
    valorEstoque: dashboardData.valorEstoque || 0,
    produtosEstoqueBaixo: dashboardData.produtosEstoqueBaixo || 0,
    produtosSemEstoque: dashboardData.produtosSemEstoque || 0,
    produtosVencendo: dashboardData.produtosVencendo || 0,
    veiculosDocumentacaoVencendo: dashboardData.veiculosDocumentacaoVencendo || 0,
    motoristasCnhVencendo: dashboardData.motoristasCnhVencendo || 0
  };

  return {
    loading,
    dashboardData,
    atividades,
    alertas,
    dadosRecentes,
    statsData,
    formatCurrency,
    formatDate,
    loadDashboardData
  };
};

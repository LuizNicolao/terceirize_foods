import api from './api';

class DashboardService {
  /**
   * Carregar dados do dashboard
   */
  static async carregarDados() {
    try {
      const response = await api.get('/dashboard');
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar dados do dashboard',
        data: {}
      };
    }
  }

  /**
   * Carregar estatísticas gerais
   */
  static async carregarEstatisticas() {
    try {
      const response = await api.get('/dashboard/estatisticas');
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar estatísticas',
        data: {}
      };
    }
  }

  /**
   * Carregar atividades recentes
   */
  static async carregarAtividadesRecentes(limit = 10) {
    try {
      const response = await api.get(`/dashboard/atividades?limit=${limit}`);
      return {
        success: true,
        data: response.data.data?.items || response.data.data || []
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar atividades',
        data: []
      };
    }
  }

  /**
   * Carregar gráficos de dados
   */
  static async carregarGraficos() {
    try {
      const response = await api.get('/dashboard/graficos');
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar gráficos',
        data: {}
      };
    }
  }

  /**
   * Carregar alertas e notificações
   */
  static async carregarAlertas() {
    try {
      const response = await api.get('/dashboard/alertas');
      return {
        success: true,
        data: response.data.data?.items || response.data.data || []
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar alertas',
        data: []
      };
    }
  }

  /**
   * Carregar métricas de performance
   */
  static async carregarMetricas() {
    try {
      const response = await api.get('/dashboard/metricas');
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar métricas',
        data: {}
      };
    }
  }
}

export default DashboardService; 
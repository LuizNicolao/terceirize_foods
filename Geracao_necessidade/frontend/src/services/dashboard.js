import api from './api';

class DashboardService {
  /**
   * Carregar dados do dashboard (estatísticas principais)
   */
  static async carregarDados(filters = {}) {
    try {
      const response = await api.get('/dashboard/stats', { params: filters });
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
  static async carregarEstatisticas(filters = {}) {
    try {
      const response = await api.get('/dashboard/stats', { params: filters });
      return {
        success: true,
        data: response.data.data?.stats || response.data.data || {}
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
      const response = await api.get('/dashboard/atividades', { 
        params: { limit } 
      });
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
   * Carregar dados recentes (escolas, produtos, necessidades, etc.)
   */
  static async carregarDadosRecentes() {
    try {
      const response = await api.get('/dashboard/recentes');
      return {
        success: true,
        data: response.data.data?.recentes || response.data.data || {}
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar dados recentes',
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
        data: response.data.data || {}
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar métricas',
        data: {}
      };
    }
  }

  /**
   * Carregar gráficos de dados
   */
  static async carregarGraficos(filters = {}) {
    try {
      const response = await api.get('/dashboard/graficos', { params: filters });
      return {
        success: true,
        data: response.data.data || {}
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar gráficos',
        data: {}
      };
    }
  }
}

export default DashboardService;

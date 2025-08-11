import { api } from './api';

class DashboardService {
  async getDashboardStats() {
    try {
      const response = await api.get('/dashboard/stats');
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        };
      } else {
        return {
          success: false,
          error: response.data.message || 'Erro ao carregar estatísticas do dashboard'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar estatísticas do dashboard'
      };
    }
  }

  async getDashboardActivity() {
    try {
      const response = await api.get('/dashboard/activity');
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar atividades do dashboard'
      };
    }
  }

  async getDashboardCharts() {
    try {
      const response = await api.get('/dashboard/charts');
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar gráficos do dashboard'
      };
    }
  }
}

export default new DashboardService();

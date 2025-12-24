import api from './api';

class DashboardService {
  async obterEstatisticas() {
    try {
      const response = await api.get('/dashboard/estatisticas');
      
      let estatisticas = null;
      
      if (response.data.data) {
        estatisticas = response.data.data;
      } else {
        estatisticas = response.data;
      }
      
      return {
        success: true,
        data: estatisticas
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar estatísticas',
        data: null
      };
    }
  }

  async obterDadosTemporais(dias = 30) {
    try {
      const response = await api.get('/dashboard/temporal', { params: { dias } });
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar dados temporais'
      };
    }
  }
}

export default new DashboardService();

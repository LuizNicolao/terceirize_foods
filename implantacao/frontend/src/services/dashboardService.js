import api from './api';

const dashboardService = {
  /**
   * Obter estatísticas gerais do dashboard
   */
  obterEstatisticas: async () => {
    try {
      const response = await api.get('/dashboard/estatisticas');
      return response.data;
    } catch (error) {
      console.error('Erro ao obter estatísticas do dashboard:', error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Erro ao carregar estatísticas'
      };
    }
  },

  /**
   * Obter resumo executivo com KPIs
   */
  obterResumoExecutivo: async () => {
    try {
      const response = await api.get('/dashboard/resumo-executivo');
      return response.data;
    } catch (error) {
      console.error('Erro ao obter resumo executivo:', error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Erro ao carregar resumo executivo'
      };
    }
  }
};

export default dashboardService;


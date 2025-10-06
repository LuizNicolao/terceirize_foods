import api from '../api';

const recebimentosRelatoriosService = {
  // Relatório de Pendências
  relatorioPendencias: async (filtros = {}) => {
    try {
      const params = new URLSearchParams();
      
      Object.keys(filtros).forEach(key => {
        if (filtros[key] !== undefined && filtros[key] !== '') {
          params.append(key, filtros[key]);
        }
      });

      const response = await api.get(`/recebimentos-escolas/relatorios/pendencias?${params.toString()}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 429) {
        return {
          success: false,
          error: 'Muitas requisições. Aguarde alguns segundos antes de tentar novamente.',
          message: 'Rate limit excedido'
        };
      }
      throw error;
    }
  },

  // Relatório de Completos
  relatorioCompletos: async (filtros = {}) => {
    try {
      const params = new URLSearchParams();
      
      Object.keys(filtros).forEach(key => {
        if (filtros[key] !== undefined && filtros[key] !== '') {
          params.append(key, filtros[key]);
        }
      });

      const response = await api.get(`/recebimentos-escolas/relatorios/completos?${params.toString()}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 429) {
        return {
          success: false,
          error: 'Muitas requisições. Aguarde alguns segundos antes de tentar novamente.',
          message: 'Rate limit excedido'
        };
      }
      throw error;
    }
  },

  // Dashboard de Relatórios
  dashboardRelatorios: async (filtros = {}) => {
    try {
      const params = new URLSearchParams();
      
      Object.keys(filtros).forEach(key => {
        if (filtros[key] !== undefined && filtros[key] !== '') {
          params.append(key, filtros[key]);
        }
      });

      const response = await api.get(`/recebimentos-escolas/relatorios/dashboard?${params.toString()}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 429) {
        return {
          success: false,
          error: 'Muitas requisições. Aguarde alguns segundos antes de tentar novamente.',
          message: 'Rate limit excedido'
        };
      }
      throw error;
    }
  }
};

export default recebimentosRelatoriosService;

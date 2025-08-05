import api from './api';

class FiliaisService {
  async listar(params = {}) {
    try {
      const response = await api.get('/filiais', { params });
      return {
        success: true,
        data: response.data.data || response.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar filiais'
      };
    }
  }

  async buscarPorId(id) {
    try {
      const response = await api.get(`/filiais/${id}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar filial'
      };
    }
  }

  async buscarAtivas() {
    try {
      const response = await api.get('/filiais/ativas/listar');
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar filiais ativas'
      };
    }
  }
}

export default new FiliaisService(); 
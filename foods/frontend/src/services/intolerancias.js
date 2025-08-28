import api from './api';

class IntoleranciasService {
  async listar(params = {}) {
    try {
      const response = await api.get('/intolerancias', { params });
      return {
        success: true,
        data: response.data.data || response.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar intolerâncias'
      };
    }
  }

  async buscarPorId(id) {
    try {
      const response = await api.get(`/intolerancias/${id}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar intolerância'
      };
    }
  }

  async criar(data) {
    try {
      const response = await api.post('/intolerancias', data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      if (error.response?.status === 422) {
        return {
          success: false,
          message: error.response.data.message || 'Dados inválidos',
          validationErrors: error.response.data.errors,
          errorCategories: error.response.data.errorCategories
        };
      }
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao criar intolerância'
      };
    }
  }

  async atualizar(id, data) {
    try {
      const response = await api.put(`/intolerancias/${id}`, data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      if (error.response?.status === 422) {
        return {
          success: false,
          message: error.response.data.message || 'Dados inválidos',
          validationErrors: error.response.data.errors,
          errorCategories: error.response.data.errorCategories
        };
      }
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao atualizar intolerância'
      };
    }
  }

  async excluir(id) {
    try {
      await api.delete(`/intolerancias/${id}`);
      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao excluir intolerância'
      };
    }
  }

  async buscarAtivas() {
    try {
      const response = await api.get('/intolerancias/ativas/listar');
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar intolerâncias ativas'
      };
    }
  }

  async buscarEstatisticas() {
    try {
      const response = await api.get('/intolerancias/stats/geral');
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar estatísticas'
      };
    }
  }

  async exportarXLSX(params = {}) {
    try {
      const response = await api.get('/intolerancias/export/xlsx', { 
        params,
        responseType: 'blob'
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao exportar dados'
      };
    }
  }

  async exportarPDF(params = {}) {
    try {
      const response = await api.get('/intolerancias/export/pdf', { 
        params,
        responseType: 'blob'
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao exportar dados'
      };
    }
  }
}

export default new IntoleranciasService();

import api from './api';

class EfetivosService {
  async listar(params = {}) {
    try {
      const response = await api.get('/efetivos', { params });
      return {
        success: true,
        data: response.data.data || response.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar efetivos'
      };
    }
  }

  async listarPorUnidade(unidadeEscolarId, params = {}) {
    try {
      const response = await api.get(`/efetivos/unidade-escolar/${unidadeEscolarId}`, { params });
      return {
        success: true,
        data: response.data.data || response.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar efetivos'
      };
    }
  }

  async buscarPorId(id) {
    try {
      const response = await api.get(`/efetivos/${id}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar efetivo'
      };
    }
  }

  async criar(data) {
    try {
      const response = await api.post('/efetivos', data);
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
        message: error.response?.data?.message || 'Erro ao criar efetivo'
      };
    }
  }

  async criarPorUnidade(unidadeEscolarId, data) {
    try {
      const response = await api.post(`/efetivos/unidade-escolar/${unidadeEscolarId}`, data);
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
        message: error.response?.data?.message || 'Erro ao criar efetivo'
      };
    }
  }

  async atualizar(id, data) {
    try {
      const response = await api.put(`/efetivos/${id}`, data);
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
        message: error.response?.data?.message || 'Erro ao atualizar efetivo'
      };
    }
  }

  async excluir(id) {
    try {
      await api.delete(`/efetivos/${id}`);
      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao excluir efetivo'
      };
    }
  }

  async buscarEstatisticas() {
    try {
      const response = await api.get('/efetivos/stats/geral');
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
      const response = await api.get('/efetivos/export/xlsx', { 
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
      const response = await api.get('/efetivos/export/pdf', { 
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

export default new EfetivosService();

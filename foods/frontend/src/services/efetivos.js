import api from './api';

class EfetivosService {


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

  async listarAgrupadosPorUnidade(unidadeEscolarId, params = {}) {
    try {
      const response = await api.get(`/efetivos/unidade-escolar/${unidadeEscolarId}/agrupados`, { params });
      return {
        success: true,
        data: response.data.data || response.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar efetivos agrupados'
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


}

export default new EfetivosService();

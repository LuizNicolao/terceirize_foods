import api from './api';

class UnidadesEscolaresService {
  static async listar(params = {}) {
    try {
      const response = await api.get('/unidades-escolares', { params });
      return {
        success: true,
        data: response.data.data || [],
        pagination: response.data.pagination || {},
        filters: response.data.filters || {}
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao listar unidades escolares',
        data: []
      };
    }
  }

  static async buscarPorId(id) {
    try {
      const response = await api.get(`/unidades-escolares/${id}`);
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar unidade escolar'
      };
    }
  }

  static async criar(data) {
    try {
      const response = await api.post('/unidades-escolares', data);
      return {
        success: true,
        data: response.data.data || response.data,
        message: 'Unidade escolar criada com sucesso!'
      };
    } catch (error) {
      // Capturar erros de validação do backend
      if (error.response?.status === 422) {
        return {
          success: false,
          error: error.response?.data?.message || 'Dados inválidos',
          validationErrors: error.response?.data?.errors,
          errorCategories: error.response?.data?.errorCategories
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao criar unidade escolar'
      };
    }
  }

  static async atualizar(id, data) {
    try {
      const response = await api.put(`/unidades-escolares/${id}`, data);
      return {
        success: true,
        data: response.data.data || response.data,
        message: 'Unidade escolar atualizada com sucesso!'
      };
    } catch (error) {
      // Capturar erros de validação do backend
      if (error.response?.status === 422) {
        return {
          success: false,
          error: error.response?.data?.message || 'Dados inválidos',
          validationErrors: error.response?.data?.errors,
          errorCategories: error.response?.data?.errorCategories
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao atualizar unidade escolar'
      };
    }
  }

  static async excluir(id) {
    try {
      const response = await api.delete(`/unidades-escolares/${id}`);
      return {
        success: true,
        data: response.data,
        message: 'Unidade escolar excluída com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao excluir unidade escolar'
      };
    }
  }

  static async buscarAtivas() {
    try {
      const response = await api.get('/unidades-escolares/ativas/listar');
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar unidades escolares ativas',
        data: []
      };
    }
  }

  static async buscarEstatisticas() {
    try {
      const response = await api.get('/unidades-escolares/estatisticas');
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao carregar estatísticas'
      };
    }
  }

  static async buscarPorEstado(estado) {
    try {
      const response = await api.get(`/unidades-escolares/estado/${estado}`);
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar unidades escolares por estado',
        data: []
      };
    }
  }

  static async buscarPorRota(rotaId) {
    try {
      const response = await api.get(`/unidades-escolares/rota/${rotaId}`);
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar unidades escolares por rota',
        data: []
      };
    }
  }

  static async listarEstados() {
    try {
      const response = await api.get('/unidades-escolares/estados/listar');
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao listar estados',
        data: []
      };
    }
  }

  static async listarCentrosDistribuicao() {
    try {
      const response = await api.get('/unidades-escolares/centros-distribuicao/listar');
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao listar centros de distribuição',
        data: []
      };
    }
  }

  static async listarAlmoxarifados(unidadeEscolarId) {
    try {
      const response = await api.get(`/unidades-escolares/${unidadeEscolarId}/almoxarifados`);
      return {
        success: true,
        data: response.data.data || [],
        unidade_escolar: response.data.unidade_escolar
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao listar almoxarifados da unidade escolar',
        data: []
      };
    }
  }
}

export default UnidadesEscolaresService; 
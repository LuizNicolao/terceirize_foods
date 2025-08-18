import api from './api';

class AjudantesService {
  async listar(params = {}) {
    try {
      const response = await api.get('/ajudantes', { params });
      return {
        success: true,
        data: response.data.data || response.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar ajudantes'
      };
    }
  }

  async buscarPorId(id) {
    try {
      const response = await api.get(`/ajudantes/${id}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar ajudante'
      };
    }
  }

  async criar(data) {
    try {
      const response = await api.post('/ajudantes', data);
      return {
        success: true,
        data: response.data,
        message: 'Ajudante criado com sucesso!'
      };
    } catch (error) {
      // Se for erro de validação (422), incluir os erros na resposta
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
        message: error.response?.data?.message || 'Erro ao criar ajudante'
      };
    }
  }

  async atualizar(id, data) {
    try {
      const response = await api.put(`/ajudantes/${id}`, data);
      return {
        success: true,
        data: response.data,
        message: 'Ajudante atualizado com sucesso!'
      };
    } catch (error) {
      // Se for erro de validação (422), incluir os erros na resposta
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
        message: error.response?.data?.message || 'Erro ao atualizar ajudante'
      };
    }
  }

  async excluir(id) {
    try {
      await api.delete(`/ajudantes/${id}`);
      return {
        success: true,
        message: 'Ajudante excluído com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao excluir ajudante'
      };
    }
  }

  async buscarAtivos() {
    try {
      const response = await api.get('/ajudantes', { params: { status: 'ativo' } });
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar ajudantes ativos'
      };
    }
  }

  async exportarXLSX() {
    try {
      const response = await api.get('/ajudantes/export/xlsx', {
        responseType: 'blob'
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao exportar XLSX'
      };
    }
  }

  async exportarPDF() {
    try {
      const response = await api.get('/ajudantes/export/pdf', {
        responseType: 'blob'
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao exportar PDF'
      };
    }
  }
}

export default new AjudantesService(); 
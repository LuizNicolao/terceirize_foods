import api from './api';

class VeiculosService {
  async listar(params = {}) {
    try {
      const response = await api.get('/veiculos', { params });
      return {
        success: true,
        data: response.data.data || response.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar veículos'
      };
    }
  }

  async buscarPorId(id) {
    try {
      const response = await api.get(`/veiculos/${id}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar veículo'
      };
    }
  }

  async criar(data) {
    try {
      const response = await api.post('/veiculos', data);
      return {
        success: true,
        data: response.data,
        message: 'Veículo criado com sucesso!'
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
        error: error.response?.data?.message || 'Erro ao criar veículo'
      };
    }
  }

  async atualizar(id, data) {
    try {
      const response = await api.put(`/veiculos/${id}`, data);
      return {
        success: true,
        data: response.data,
        message: 'Veículo atualizado com sucesso!'
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
        error: error.response?.data?.message || 'Erro ao atualizar veículo'
      };
    }
  }

  async excluir(id) {
    try {
      await api.delete(`/veiculos/${id}`);
      return {
        success: true,
        message: 'Veículo excluído com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao excluir veículo'
      };
    }
  }

  async buscarAtivos() {
    try {
      const response = await api.get('/veiculos', { params: { status: 'ativo' } });
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar veículos ativos'
      };
    }
  }

  async exportarXLSX() {
    try {
      const response = await api.get('/veiculos/export/xlsx', {
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
      const response = await api.get('/veiculos/export/pdf', {
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

export default new VeiculosService(); 
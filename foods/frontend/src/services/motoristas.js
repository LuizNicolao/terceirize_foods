import api from './api';

class MotoristasService {
  async listar(params = {}) {
    try {
      const response = await api.get('/motoristas', { params });
      return {
        success: true,
        data: response.data.data || response.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar motoristas'
      };
    }
  }

  async buscarPorId(id) {
    try {
      const response = await api.get(`/motoristas/${id}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar motorista'
      };
    }
  }

  async criar(data) {
    try {
      const response = await api.post('/motoristas', data);
      return {
        success: true,
        data: response.data,
        message: 'Motorista criado com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao criar motorista'
      };
    }
  }

  async atualizar(id, data) {
    try {
      const response = await api.put(`/motoristas/${id}`, data);
      return {
        success: true,
        data: response.data,
        message: 'Motorista atualizado com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao atualizar motorista'
      };
    }
  }

  async excluir(id) {
    try {
      await api.delete(`/motoristas/${id}`);
      return {
        success: true,
        message: 'Motorista excluído com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao excluir motorista'
      };
    }
  }

  async buscarAtivos() {
    try {
      const response = await api.get('/motoristas', { params: { status: 'ativo' } });
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar motoristas ativos'
      };
    }
  }

  async exportarXLSX() {
    try {
      const response = await api.get('/motoristas/export/xlsx', {
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
      const response = await api.get('/motoristas/export/pdf', {
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

export default new MotoristasService(); 
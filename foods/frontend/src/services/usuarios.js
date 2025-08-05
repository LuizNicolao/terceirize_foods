import api from './api';

class UsuariosService {
  async listar(params = {}) {
    try {
      const response = await api.get('/usuarios', { params });
      return {
        success: true,
        data: response.data.data || response.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar usuários'
      };
    }
  }

  async buscarPorId(id) {
    try {
      const response = await api.get(`/usuarios/${id}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar usuário'
      };
    }
  }

  async criar(data) {
    try {
      const response = await api.post('/usuarios', data);
      return {
        success: true,
        data: response.data,
        message: 'Usuário criado com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao criar usuário'
      };
    }
  }

  async atualizar(id, data) {
    try {
      const response = await api.put(`/usuarios/${id}`, data);
      return {
        success: true,
        data: response.data,
        message: 'Usuário atualizado com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao atualizar usuário'
      };
    }
  }

  async excluir(id) {
    try {
      await api.delete(`/usuarios/${id}`);
      return {
        success: true,
        message: 'Usuário excluído com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao excluir usuário'
      };
    }
  }

  async buscarAtivos() {
    try {
      const response = await api.get('/usuarios', { params: { status: 'ativo' } });
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar usuários ativos'
      };
    }
  }

  async exportarXLSX() {
    try {
      const response = await api.get('/usuarios/export/xlsx', {
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
      const response = await api.get('/usuarios/export/pdf', {
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

export default new UsuariosService(); 
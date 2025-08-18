import api from './api';

class UsuariosService {
  async listar(params = {}) {
    try {
      const response = await api.get('/usuarios', { params });
      
      // Extrair dados da estrutura HATEOAS
      let usuarios = [];
      let pagination = null;
      
      if (response.data.data) {
        // Se tem data.items (estrutura HATEOAS)
        if (response.data.data.items) {
          usuarios = response.data.data.items;
          pagination = response.data.data._meta?.pagination;
        } else {
          // Se data é diretamente um array
          usuarios = response.data.data;
        }
      } else if (Array.isArray(response.data)) {
        // Se response.data é diretamente um array
        usuarios = response.data;
      }
      
      return {
        success: true,
        data: usuarios,
        pagination: pagination || response.data.pagination
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
      
      // Extrair dados da estrutura HATEOAS
      let usuario = null;
      
      if (response.data.data) {
        usuario = response.data.data;
      } else {
        usuario = response.data;
      }
      
      return {
        success: true,
        data: usuario
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
      
      // Extrair dados da estrutura HATEOAS
      let usuario = null;
      
      if (response.data.data) {
        usuario = response.data.data;
      } else {
        usuario = response.data;
      }
      
      return {
        success: true,
        data: usuario,
        message: 'Usuário criado com sucesso!'
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
        message: error.response?.data?.message || 'Erro ao criar usuário'
      };
    }
  }

  async atualizar(id, data) {
    try {
      const response = await api.put(`/usuarios/${id}`, data);
      
      // Extrair dados da estrutura HATEOAS
      let usuario = null;
      
      if (response.data.data) {
        usuario = response.data.data;
      } else {
        usuario = response.data;
      }
      
      return {
        success: true,
        data: usuario,
        message: 'Usuário atualizado com sucesso!'
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
        message: error.response?.data?.message || 'Erro ao atualizar usuário'
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
      
      // Extrair dados da estrutura HATEOAS
      let usuarios = [];
      
      if (response.data.data) {
        // Se tem data.items (estrutura HATEOAS)
        if (response.data.data.items) {
          usuarios = response.data.data.items;
        } else {
          // Se data é diretamente um array
          usuarios = response.data.data;
        }
      } else if (Array.isArray(response.data)) {
        // Se response.data é diretamente um array
        usuarios = response.data;
      }
      
      return {
        success: true,
        data: usuarios
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
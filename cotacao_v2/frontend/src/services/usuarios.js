import { api } from './api';

class UsuariosService {
  async getUsuarios(page = 1, limit = 10, filters = {}) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters
      });

      const response = await api.get(`/usuarios?${params}`);
      
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

  async getUsuario(id) {
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

  async createUsuario(usuarioData) {
    try {
      const response = await api.post('/usuarios', usuarioData);
      
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
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao criar usuário'
      };
    }
  }

  async updateUsuario(id, usuarioData) {
    try {
      const response = await api.put(`/usuarios/${id}`, usuarioData);
      
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
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao atualizar usuário'
      };
    }
  }

  async deleteUsuario(id) {
    try {
      const response = await api.delete(`/usuarios/${id}`);
      
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

  async getUsuariosPorRole(role) {
    try {
      const response = await api.get(`/usuarios/role/${role}`);
      
      let usuarios = [];
      if (response.data.data) {
        usuarios = response.data.data;
      } else if (Array.isArray(response.data)) {
        usuarios = response.data;
      }
      
      return {
        success: true,
        data: usuarios
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar usuários por role'
      };
    }
  }

  async getUsuariosAtivos() {
    try {
      const response = await api.get('/usuarios/ativos');
      
      let usuarios = [];
      if (response.data.data) {
        usuarios = response.data.data;
      } else if (Array.isArray(response.data)) {
        usuarios = response.data;
      }
      
      return {
        success: true,
        data: usuarios
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar usuários ativos'
      };
    }
  }

  async exportUsuarios(format = 'excel', filters = {}) {
    try {
      const params = new URLSearchParams({
        format,
        ...filters
      });

      const response = await api.get(`/usuarios/export?${params}`, {
        responseType: 'blob'
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao exportar usuários'
      };
    }
  }

  async importUsuarios(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/usuarios/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return {
        success: true,
        data: response.data,
        message: 'Usuários importados com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao importar usuários'
      };
    }
  }

  async getUsuarioStats() {
    try {
      const response = await api.get('/usuarios/stats');
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar estatísticas'
      };
    }
  }

  async changeStatus(id, status) {
    try {
      const response = await api.patch(`/usuarios/${id}/status`, { status });
      
      return {
        success: true,
        data: response.data,
        message: 'Status alterado com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao alterar status'
      };
    }
  }

  async resetPassword(id) {
    try {
      const response = await api.post(`/usuarios/${id}/reset-password`);
      
      return {
        success: true,
        data: response.data,
        message: 'Senha redefinida com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao redefinir senha'
      };
    }
  }

  async updatePermissions(id, permissions) {
    try {
      const response = await api.patch(`/usuarios/${id}/permissions`, { permissions });
      
      return {
        success: true,
        data: response.data,
        message: 'Permissões atualizadas com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao atualizar permissões'
      };
    }
  }
}

export default new UsuariosService();

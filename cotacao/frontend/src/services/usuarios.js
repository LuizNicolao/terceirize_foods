import api from './api';

export const usuariosService = {
  // Buscar todos os usuários
  getUsuarios: async () => {
    try {
      const response = await api.get('/users');
      
      if (response.data.success) {
        return response.data.data.data || response.data.data;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      throw error;
    }
  },

  // Buscar usuário por ID
  getUsuario: async (id) => {
    try {
      const response = await api.get(`/users/${id}`);
      
      if (response.data.success) {
        return response.data.data.data || response.data.data;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      throw error;
    }
  },

  // Criar novo usuário
  createUsuario: async (userData) => {
    try {
      const response = await api.post('/users', userData);
      
      if (response.data.success) {
        return response.data.data.data || response.data.data;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      throw error;
    }
  },

  // Atualizar usuário
  updateUsuario: async (id, userData) => {
    try {
      const response = await api.put(`/users/${id}`, userData);
      
      if (response.data.success) {
        return response.data.data.data || response.data.data;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      throw error;
    }
  },

  // Excluir usuário
  deleteUsuario: async (id) => {
    try {
      const response = await api.delete(`/users/${id}`);
      
      if (response.data.success) {
        return response.data.data.data || response.data.data;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      throw error;
    }
  },

  // Buscar permissões do usuário
  getUsuarioPermissions: async (id) => {
    try {
      const response = await api.get(`/users/${id}/permissions`);
      
      if (response.data.success) {
        return response.data.data.data || response.data.data;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      throw error;
    }
  }
};

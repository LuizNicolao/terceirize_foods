import api from './api';

export const authService = {
  // Login do usuário
  login: async (email, senha, rememberMe = false) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        senha,
        rememberMe
      });
      
      // Verificar se a resposta segue o padrão RESTful
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Erro no login'
        };
      }
    } catch (error) {
      if (error.response?.data) {
        return {
          success: false,
          message: error.response.data.message || 'Erro no login',
          errors: error.response.data.errors
        };
      }
      throw error;
    }
  },

  // Logout do usuário
  logout: async () => {
    try {
      const response = await api.post('/auth/logout');
      return {
        success: true,
        message: response.data.message || 'Logout realizado com sucesso'
      };
    } catch (error) {
      // Mesmo com erro, consideramos logout bem-sucedido no frontend
      return {
        success: true,
        message: 'Logout realizado'
      };
    }
  },

  // Verificar status da autenticação
  checkAuth: async () => {
    try {
      const response = await api.get('/auth/verify');
      
      if (response.data.success) {
        return response.data.data.user;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      throw error;
    }
  },

  // SSO Login
  ssoLogin: async (token) => {
    try {
      const response = await api.post('/auth/sso', { token });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Erro no SSO'
        };
      }
    } catch (error) {
      if (error.response?.data) {
        return {
          success: false,
          message: error.response.data.message || 'Erro no SSO'
        };
      }
      throw error;
    }
  },

  // Buscar permissões do usuário
  getUserPermissions: async (userId) => {
    try {
      const response = await api.get(`/auth/users/${userId}/permissions`);
      
      if (response.data.success) {
        return response.data.data.permissions;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      throw error;
    }
  }
};

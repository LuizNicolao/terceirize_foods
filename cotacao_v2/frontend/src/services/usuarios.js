const API_URL = process.env.REACT_APP_API_URL || 'http://82.29.57.43:5000';

class UsuariosService {
  constructor() {
    this.baseURL = `${API_URL}/api/users`;
  }

  // Obter token de autenticação
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  // Tratar resposta da API
  async handleResponse(response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  // GET /api/users - Listar todos os usuários
  async getUsuarios() {
    try {
      const response = await fetch(this.baseURL, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Erro no service getUsuarios:', error);
      throw error;
    }
  }

  // GET /api/users/:id - Buscar usuário específico
  async getUsuario(id) {
    try {
      const response = await fetch(`${this.baseURL}/${id}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Erro no service getUsuario:', error);
      throw error;
    }
  }

  // POST /api/users - Criar novo usuário
  async createUsuario(userData) {
    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(userData)
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Erro no service createUsuario:', error);
      throw error;
    }
  }

  // PUT /api/users/:id - Atualizar usuário
  async updateUsuario(id, userData) {
    try {
      const response = await fetch(`${this.baseURL}/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(userData)
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Erro no service updateUsuario:', error);
      throw error;
    }
  }

  // DELETE /api/users/:id - Excluir usuário
  async deleteUsuario(id) {
    try {
      const response = await fetch(`${this.baseURL}/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Erro no service deleteUsuario:', error);
      throw error;
    }
  }

  // GET /api/users/:id/permissions - Buscar permissões do usuário
  async getUsuarioPermissions(id) {
    try {
      const response = await fetch(`${this.baseURL}/${id}/permissions`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Erro no service getUsuarioPermissions:', error);
      throw error;
    }
  }

  // PUT /api/users/:id/permissions - Atualizar permissões do usuário
  async updateUsuarioPermissions(id, permissions) {
    try {
      const response = await fetch(`${this.baseURL}/${id}/permissions`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(permissions)
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Erro no service updateUsuarioPermissions:', error);
      throw error;
    }
  }

  // POST /api/users/:id/change-password - Alterar senha
  async changePassword(id, passwordData) {
    try {
      const response = await fetch(`${this.baseURL}/${id}/change-password`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(passwordData)
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Erro no service changePassword:', error);
      throw error;
    }
  }

  // POST /api/users/:id/activate - Ativar usuário
  async activateUsuario(id) {
    try {
      const response = await fetch(`${this.baseURL}/${id}/activate`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Erro no service activateUsuario:', error);
      throw error;
    }
  }

  // POST /api/users/:id/deactivate - Desativar usuário
  async deactivateUsuario(id) {
    try {
      const response = await fetch(`${this.baseURL}/${id}/deactivate`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Erro no service deactivateUsuario:', error);
      throw error;
    }
  }
}

// Exportar instância única do service
export const usuariosService = new UsuariosService();

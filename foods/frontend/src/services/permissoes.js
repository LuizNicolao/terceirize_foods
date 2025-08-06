import api from './api';

class PermissoesService {
  /**
   * Listar usuários
   */
  static async listarUsuarios(params = {}) {
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

  /**
   * Buscar permissões de um usuário
   */
  static async buscarPermissoesUsuario(userId) {
    try {
      const response = await api.get(`/permissoes/usuario/${userId}`);
      
      // Extrair dados da estrutura HATEOAS
      let permissoes = [];
      
      if (response.data.data) {
        permissoes = response.data.data;
      } else if (Array.isArray(response.data)) {
        permissoes = response.data;
      }
      
      return {
        success: true,
        data: permissoes
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar permissões'
      };
    }
  }

  /**
   * Salvar permissões de um usuário
   */
  static async salvarPermissoes(userId, permissoes) {
    try {
      const response = await api.post(`/permissoes/usuario/${userId}`, { permissoes });
      
      return {
        success: true,
        data: response.data,
        message: 'Permissões salvas com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao salvar permissões'
      };
    }
  }

  /**
   * Resetar permissões de um usuário
   */
  static async resetarPermissoes(userId) {
    try {
      const response = await api.delete(`/permissoes/usuario/${userId}`);
      
      return {
        success: true,
        message: 'Permissões resetadas com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao resetar permissões'
      };
    }
  }

  /**
   * Sincronizar permissões de um usuário
   */
  static async sincronizarPermissoes(userId) {
    try {
      const response = await api.post(`/permissoes/usuario/${userId}/sync`);
      
      return {
        success: true,
        data: response.data,
        message: 'Permissões sincronizadas com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao sincronizar permissões'
      };
    }
  }

  /**
   * Buscar usuário por ID
   */
  static async buscarUsuarioPorId(id) {
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

  /**
   * Exportar permissões para XLSX
   */
  static async exportarXLSX(params = {}) {
    try {
      const response = await api.get('/permissoes/export/xlsx', { 
        params,
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

  /**
   * Exportar permissões para PDF
   */
  static async exportarPDF(params = {}) {
    try {
      const response = await api.get('/permissoes/export/pdf', { 
        params,
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

export default PermissoesService; 
import api from './api';

class PermissoesService {
  /**
   * Listar usuários
   */
  static async listarUsuarios(params = {}) {
    try {
      const response = await api.get('/permissoes/usuarios', { params });
      
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
      
      // O backend retorna { success: true, data: { usuario, permissoes: [...] } }
      // Retornar diretamente response.data para evitar duplicação
      return response.data;
    } catch (error) {
      console.error('Erro na API de permissões:', error);
      
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar permissões'
      };
    }
  }

  /**
   * Atualizar permissões de um usuário
   */
  static async atualizarPermissoes(userId, permissoes) {
    try {
      const response = await api.put(`/permissoes/usuario/${userId}`, { permissoes });
      
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

  /**
   * Salvar permissões de um usuário
   */
  static async salvarPermissoes(userId, permissoes) {
    try {
      const response = await api.put(`/permissoes/usuario/${userId}`, { permissoes });
      
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
      const response = await api.post(`/permissoes/usuario/${userId}/reset`);
      
      return {
        success: true,
        data: response.data,
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
   * Listar todas as telas disponíveis
   */
  static async listarTelas() {
    try {
      const response = await api.get('/permissoes/telas');
      
      // Extrair dados da estrutura HATEOAS
      let telas = [];
      
      if (response.data.data) {
        // Se tem data.items (estrutura HATEOAS)
        if (response.data.data.items) {
          telas = response.data.data.items;
        } else {
          // Se data é diretamente um array
          telas = response.data.data;
        }
      } else if (Array.isArray(response.data)) {
        // Se response.data é diretamente um array
        telas = response.data;
      }
      
      return {
        success: true,
        data: telas
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar telas'
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
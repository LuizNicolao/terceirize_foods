import api from './api';

class PermissoesService {
  static async listarUsuarios(params = {}) {
    try {
      const response = await api.get('/permissoes/usuarios', { params });

      let usuarios = [];
      let pagination = null;

      if (response.data.data) {
        if (response.data.data.items) {
          usuarios = response.data.data.items;
          pagination = response.data.data._meta?.pagination;
        } else {
          usuarios = response.data.data;
        }
      } else if (Array.isArray(response.data)) {
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

  static async buscarPermissoesUsuario(userId) {
    try {
      const response = await api.get(`/permissoes/usuario/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Erro na API de permissões:', error);

      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar permissões'
      };
    }
  }

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

  static async listarTelas() {
    try {
      const response = await api.get('/permissoes/telas');

      let telas = [];

      if (response.data.data) {
        if (response.data.data.items) {
          telas = response.data.data.items;
        } else {
          telas = response.data.data;
        }
      } else if (Array.isArray(response.data)) {
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

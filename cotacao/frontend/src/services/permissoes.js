import api from './api';

class PermissoesService {
  /**
   * Listar usuários
   */
  static async listarUsuarios(params = {}) {
    try {
      const response = await api.get('/users');

      let usuarios = [];
      if (response.data?.data?.data) {
        usuarios = response.data.data.data;
      } else if (response.data?.data) {
        usuarios = Array.isArray(response.data.data) ? response.data.data : [response.data.data];
      } else if (Array.isArray(response.data)) {
        usuarios = response.data;
      }

      const mapped = usuarios.map((usuario) => ({
        id: usuario.id,
        nome: usuario.name,
        email: usuario.email,
        status: typeof usuario.status === 'string' ? usuario.status : usuario.status === 1 ? 'ativo' : 'inativo',
        tipo_de_acesso: usuario.role || 'comprador',
        nivel_de_acesso: usuario.nivel_de_acesso || 'I'
      }));

      const permissoesCounts = await Promise.all(
        mapped.map(async (usuario) => {
          try {
            const permsResponse = await api.get(`/permissoes/usuario/${usuario.id}`);
            const permissoes = permsResponse.data?.permissoes || permsResponse.data?.data?.permissoes || [];
            return Array.isArray(permissoes) ? permissoes.length : 0;
          } catch (error) {
            return 0;
          }
        })
      );

      const enriched = mapped.map((usuario, index) => ({
        ...usuario,
        permissoes_count: permissoesCounts[index]
      }));

      return {
        success: true,
        data: enriched
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
      const permissoes = response.data?.permissoes || response.data?.data?.permissoes || [];

      return {
        success: true,
        data: {
          permissoes: Array.isArray(permissoes) ? permissoes : []
        }
      };
    } catch (error) {
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
      const payload = Array.isArray(permissoes)
        ? permissoes.map((permissao) => ({
            screen: permissao.tela || permissao.screen,
            can_view: permissao.pode_visualizar ? 1 : 0,
            can_create: permissao.pode_criar ? 1 : 0,
            can_edit: permissao.pode_editar ? 1 : 0,
            can_delete: permissao.pode_excluir ? 1 : 0
          }))
        : [];

      const response = await api.post(`/permissoes/usuario/${userId}`, { permissoes: payload });

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
      const telas = response.data?.telas || response.data?.data || [];
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
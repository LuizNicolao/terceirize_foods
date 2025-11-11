import api from './api';
import { usuariosService } from './usuarios';

const mapUsuarioParaPermissoes = (usuario) => {
  const permissionsArray = Array.isArray(usuario.permissions) ? usuario.permissions : [];
  const permissoesAtivas = permissionsArray.filter((perm) => {
    if (!perm) return false;
    return perm.can_view || perm.can_create || perm.can_edit || perm.can_delete;
  });

  return {
    ...usuario,
    nome: usuario.name || usuario.nome || '',
    tipo_de_acesso: usuario.role || '',
    nivel_de_acesso: usuario.role || '',
    permissoes_count: permissoesAtivas.length
  };
};

class PermissoesService {
  static async listarUsuarios() {
    try {
      const usuarios = await usuariosService.getUsuarios();
      const lista = Array.isArray(usuarios) ? usuarios : [];

      return {
        success: true,
        data: lista.map(mapUsuarioParaPermissoes)
      };
    } catch (error) {
      console.error('Erro ao listar usuários para permissões:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar usuários'
      };
    }
  }

  static async buscarPermissoesUsuario(userId) {
    try {
      const response = await api.get(`/permissoes/usuario/${userId}`);

      if (!response.data?.success) {
        return {
          success: false,
          error: response.data?.message || 'Erro ao carregar permissões'
        };
      }

      const permissoes = Array.isArray(response.data.permissoes)
        ? response.data.permissoes
        : [];

      return {
        success: true,
        data: permissoes.map((perm) => ({
          screen: perm.screen,
          can_view: perm.can_view === 1 || perm.can_view === true,
          can_create: perm.can_create === 1 || perm.can_create === true,
          can_edit: perm.can_edit === 1 || perm.can_edit === true,
          can_delete: perm.can_delete === 1 || perm.can_delete === true
        }))
      };
    } catch (error) {
      console.error('Erro ao buscar permissões do usuário:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar permissões'
      };
    }
  }

  static async salvarPermissoes(userId, permissoes) {
    try {
      await api.post(`/permissoes/usuario/${userId}`, { permissoes });
      return {
        success: true
      };
    } catch (error) {
      console.error('Erro ao salvar permissões:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao salvar permissões'
      };
    }
  }
}

export default PermissoesService;
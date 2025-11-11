import api from './api';

const mapRoleToNivel = (role) => {
  switch (role) {
    case 'administrador':
      return 'III';
    case 'gestor':
    case 'supervisor':
      return 'II';
    default:
      return 'I';
  }
};

class UsuariosService {
  async listar(params = {}) {
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

      const mappedUsuarios = usuarios.map((usuario) => this.normalizeUsuario(usuario));

      let filteredUsuarios = mappedUsuarios;

      if (params.search) {
        const term = params.search.toString().toLowerCase();
        filteredUsuarios = filteredUsuarios.filter((usuario) =>
          (usuario.nome || '').toLowerCase().includes(term) ||
          (usuario.email || '').toLowerCase().includes(term)
        );
      }

      if (params.status !== undefined && params.status !== null && params.status !== 'todos') {
        const statusFilter = params.status.toString().toLowerCase();
        filteredUsuarios = filteredUsuarios.filter(
          (usuario) => (usuario.status || '').toLowerCase() === statusFilter
        );
      }

      const page = parseInt(params.page, 10) > 0 ? parseInt(params.page, 10) : 1;
      const limit = parseInt(params.limit, 10) > 0 ? parseInt(params.limit, 10) : filteredUsuarios.length || 10;
      const startIndex = (page - 1) * limit;
      const paginated = filteredUsuarios.slice(startIndex, startIndex + limit);

      const pagination = {
        page,
        limit,
        total: filteredUsuarios.length,
        totalPages: Math.max(1, Math.ceil(filteredUsuarios.length / (limit || 1)))
      };

      return {
        success: true,
        data: paginated,
        pagination
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
      const response = await api.get(`/users/${id}`);

      let usuario = null;
      if (response.data?.data?.data) {
        usuario = response.data.data.data;
      } else if (response.data?.data) {
        usuario = response.data.data;
      } else {
        usuario = response.data;
      }

      const permissions = Array.isArray(usuario.permissions) ? usuario.permissions : [];

      return {
        success: true,
        data: {
          ...this.normalizeUsuario(usuario),
          permissions: permissions.map((permission) => ({
            screen: permission.screen,
            can_view: permission.can_view === 1 || permission.can_view === true,
            can_create: permission.can_create === 1 || permission.can_create === true,
            can_edit: permission.can_edit === 1 || permission.can_edit === true,
            can_delete: permission.can_delete === 1 || permission.can_delete === true
          }))
        }
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
      const payload = this.preparePayload(data);
      const response = await api.post('/users', payload);

      let usuario = null;
      if (response.data?.data?.data) {
        usuario = response.data.data.data;
      } else if (response.data?.data) {
        usuario = response.data.data;
      } else {
        usuario = response.data;
      }

      return {
        success: true,
        data: this.normalizeUsuario(usuario),
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
      const payload = this.preparePayload(data);
      const response = await api.put(`/users/${id}`, payload);

      let usuario = null;
      if (response.data?.data?.data) {
        usuario = response.data.data.data;
      } else if (response.data?.data) {
        usuario = response.data.data;
      } else {
        usuario = response.data;
      }

      return {
        success: true,
        data: this.normalizeUsuario(usuario),
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
      await api.delete(`/users/${id}`);
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
      const response = await api.get('/users');

      let usuarios = [];
      if (response.data?.data?.data) {
        usuarios = response.data.data.data;
      } else if (response.data?.data) {
        usuarios = Array.isArray(response.data.data) ? response.data.data : [response.data.data];
      } else if (Array.isArray(response.data)) {
        usuarios = response.data;
      }

      const ativos = usuarios
        .map((usuario) => this.normalizeUsuario(usuario))
        .filter((usuario) => (usuario.status || '').toLowerCase() === 'ativo');

      return {
        success: true,
        data: ativos
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
      const response = await api.get('/users/export/xlsx', {
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
      const response = await api.get('/users/export/pdf', {
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

  normalizeUsuario(usuario) {
    if (!usuario) return {};

    const status =
      typeof usuario.status === 'string'
        ? usuario.status.toLowerCase()
        : usuario.status === 1
        ? 'ativo'
        : 'inativo';

    const role = usuario.role || 'comprador';

    return {
      id: usuario.id,
      name: usuario.name,
      nome: usuario.name,
      email: usuario.email,
      role,
      tipo_de_acesso: role,
      nivel_de_acesso: mapRoleToNivel(role),
      status,
      created_at: usuario.created_at,
      updated_at: usuario.updated_at
    };
  }

  preparePayload(data) {
    const payload = {
      name: data.name?.trim() || data.nome?.trim(),
      email: data.email?.trim(),
      role: data.role || data.tipo_de_acesso || 'comprador',
      status: data.status || 'ativo'
    };

    if (data.password && data.password.trim() !== '') {
      payload.password = data.password.trim();
    } else if (data.senha && data.senha.trim() !== '') {
      payload.password = data.senha.trim();
    }

    if (Array.isArray(data.permissions)) {
      payload.permissions = data.permissions.map((permission) => ({
        screen: permission.screen,
        can_view: permission.can_view ? 1 : 0,
        can_create: permission.can_create ? 1 : 0,
        can_edit: permission.can_edit ? 1 : 0,
        can_delete: permission.can_delete ? 1 : 0
      }));
    } else if (data.permissions && typeof data.permissions === 'object') {
      payload.permissions = Object.entries(data.permissions).map(([screen, perms]) => ({
        screen,
        can_view: perms.can_view ? 1 : 0,
        can_create: perms.can_create ? 1 : 0,
        can_edit: perms.can_edit ? 1 : 0,
        can_delete: perms.can_delete ? 1 : 0
      }));
    }

    if (payload.password === undefined) {
      delete payload.password;
    }

    if (!payload.permissions || payload.permissions.length === 0) {
      delete payload.permissions;
    }

    return payload;
  }
}

export default new UsuariosService();
import api from './api';

const permissoesService = {
  // Listar permissões do usuário logado
  listar: async (usuarioId = null) => {
    // Se não passar usuarioId, usa a rota /me
    const endpoint = usuarioId ? `/permissoes/${usuarioId}` : '/permissoes/me';
    const response = await api.get(endpoint);
    return response.data;
  },

  // Atualizar permissões de um usuário
  atualizar: async (usuarioId, permissoes) => {
    const response = await api.put(`/permissoes/${usuarioId}`, { permissoes });
    return response.data;
  },

  // Resetar permissões para padrão
  resetarPadrao: async (usuarioId) => {
    const response = await api.post(`/permissoes/${usuarioId}/reset`);
    return response.data;
  },

  // Verificar permissão específica
  verificarPermissao: async (usuarioId, tela, acao) => {
    const response = await api.get(`/permissoes/${usuarioId}/${tela}/${acao}`);
    return response.data;
  }
};

export default permissoesService;

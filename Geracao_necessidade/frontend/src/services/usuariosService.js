import api from './api';

const usuariosService = {
  // Listar usuários com paginação e filtros
  listar: async (filtros = {}) => {
    const params = new URLSearchParams();
    
    // Adicionar parâmetros de paginação
    if (filtros.page) params.append('page', filtros.page);
    if (filtros.limit) params.append('limit', filtros.limit);
    
    // Adicionar filtros de busca
    if (filtros.search) params.append('search', filtros.search);
    if (filtros.tipo_usuario) params.append('tipo_usuario', filtros.tipo_usuario);
    if (filtros.ativo !== undefined) params.append('ativo', filtros.ativo);
    if (filtros.rota) params.append('rota', filtros.rota);
    if (filtros.setor) params.append('setor', filtros.setor);
    
    // Adicionar filtros de data
    if (filtros.data_inicio) params.append('data_inicio', filtros.data_inicio);
    if (filtros.data_fim) params.append('data_fim', filtros.data_fim);
    
    const queryString = params.toString();
    const url = `/usuarios${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  },

  // Buscar usuário por ID
  buscar: async (id) => {
    const response = await api.get(`/usuarios/${id}`);
    return response.data;
  },

  // Criar novo usuário
  criar: async (usuario) => {
    const response = await api.post('/usuarios', usuario);
    return response.data;
  },

  // Atualizar usuário
  atualizar: async (id, usuario) => {
    const response = await api.put(`/usuarios/${id}`, usuario);
    return response.data;
  },

  // Deletar usuário
  deletar: async (id) => {
    const response = await api.delete(`/usuarios/${id}`);
    return response.data;
  },

  // Buscar usuários por email
  buscarPorEmail: async (email) => {
    const response = await api.get(`/usuarios/buscar/${email}`);
    return response.data;
  }
};

export default usuariosService;

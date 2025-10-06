import api from './api';

const produtosService = {
  // Listar produtos com filtros
  listar: async (filtros = {}) => {
    const params = new URLSearchParams();
    
    Object.keys(filtros).forEach(key => {
      if (filtros[key] !== undefined && filtros[key] !== '') {
        params.append(key, filtros[key]);
      }
    });

    // Usar a rota de recebimentos-escolas que o usuário tem permissão
    const url = `/recebimentos-escolas/produtos?${params.toString()}`;
    const response = await api.get(url);
    return response.data;
  },

  // Buscar produto por ID
  buscarPorId: async (id) => {
    const response = await api.get(`/produtos/${id}`);
    return response.data;
  },

  // Criar novo produto
  criar: async (dados) => {
    const response = await api.post('/produtos', dados);
    return response.data;
  },

  // Atualizar produto
  atualizar: async (id, dados) => {
    const response = await api.put(`/produtos/${id}`, dados);
    return response.data;
  },

  // Deletar produto
  deletar: async (id) => {
    const response = await api.delete(`/produtos/${id}`);
    return response.data;
  }
};

export default produtosService;

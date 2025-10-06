import api from './api';

const recebimentosEscolasService = {
  // Listar recebimentos com filtros
  listar: async (filtros = {}) => {
    const params = new URLSearchParams();
    
    Object.keys(filtros).forEach(key => {
      if (filtros[key] !== undefined && filtros[key] !== '') {
        params.append(key, filtros[key]);
      }
    });

    const response = await api.get(`/recebimentos-escolas?${params.toString()}`);
    return response.data;
  },

  // Listar todos os recebimentos (sem paginação)
  listarTodas: async (filtros = {}) => {
    const params = new URLSearchParams();
    
    Object.keys(filtros).forEach(key => {
      if (filtros[key] !== undefined && filtros[key] !== '') {
        params.append(key, filtros[key]);
      }
    });

    const response = await api.get(`/recebimentos-escolas/todas?${params.toString()}`);
    return response.data;
  },

  // Buscar recebimento por ID
  buscarPorId: async (id) => {
    const response = await api.get(`/recebimentos-escolas/${id}`);
    return response.data;
  },

  // Criar novo recebimento
  criar: async (dados) => {
    const response = await api.post('/recebimentos-escolas', dados);
    return response.data;
  },

  // Atualizar recebimento
  atualizar: async (id, dados) => {
    const response = await api.put(`/recebimentos-escolas/${id}`, dados);
    return response.data;
  },

  // Deletar recebimento
  deletar: async (id) => {
    const response = await api.delete(`/recebimentos-escolas/${id}`);
    return response.data;
  }
};

export default recebimentosEscolasService;

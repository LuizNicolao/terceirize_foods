import api from './api';

const mediasEscolasService = {
  // Listar médias do nutricionista
  listar: async (params = {}) => {
    const response = await api.get('/medias-escolas', { params });
    return response.data;
  },

  // Listar escolas do nutricionista
  listarEscolas: async () => {
    const response = await api.get('/medias-escolas/escolas');
    return response.data;
  },

  // Buscar médias de uma escola específica
  buscarPorEscola: async (escolaId) => {
    const response = await api.get(`/medias-escolas/escola/${escolaId}`);
    return response.data;
  },

  // Criar médias para uma escola
  criar: async (dados) => {
    const response = await api.post('/medias-escolas', dados);
    return response.data;
  },

  // Atualizar médias
  atualizar: async (id, dados) => {
    const response = await api.put(`/medias-escolas/${id}`, dados);
    return response.data;
  },

  // Deletar médias
  deletar: async (id) => {
    const response = await api.delete(`/medias-escolas/${id}`);
    return response.data;
  }
};

export default mediasEscolasService;

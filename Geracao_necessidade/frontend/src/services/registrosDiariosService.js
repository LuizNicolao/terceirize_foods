import api from './api';

const registrosDiariosService = {
  // Método para compatibilidade com useBaseEntity
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.search) queryParams.append('search', params.search);
    if (params.escola_id) queryParams.append('escola_id', params.escola_id);
    if (params.tipo_media) queryParams.append('tipo_media', params.tipo_media);
    if (params.data_inicio) queryParams.append('data_inicio', params.data_inicio);
    if (params.data_fim) queryParams.append('data_fim', params.data_fim);
    
    const response = await api.get(`/registros-diarios?${queryParams.toString()}`);
    
    // Retornar no formato esperado pelo useBaseEntity
    return {
      data: response.data.data || [],
      totalPages: 1,
      total: response.data.data?.length || 0,
      estatisticas: {}
    };
  },

  listar: async (filtros = {}) => {
    const params = new URLSearchParams();
    
    if (filtros.escola_id) params.append('escola_id', filtros.escola_id);
    if (filtros.tipo_media) params.append('tipo_media', filtros.tipo_media);
    if (filtros.data_inicio) params.append('data_inicio', filtros.data_inicio);
    if (filtros.data_fim) params.append('data_fim', filtros.data_fim);
    if (filtros.limit) params.append('limit', filtros.limit);
    if (filtros.page) params.append('page', filtros.page);
    
    const response = await api.get(`/registros-diarios?${params.toString()}`);
    return response.data;
  },

  create: async (dados) => {
    const response = await api.post('/registros-diarios', dados);
    return response.data;
  },

  update: async (id, dados) => {
    const response = await api.put(`/registros-diarios/${id}`, dados);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/registros-diarios/${id}`);
    return response.data;
  },

  calcularMedias: async (escola_id = null) => {
    const response = await api.post('/registros-diarios/calcular-medias', { escola_id });
    return response.data;
  }
};

export default registrosDiariosService;

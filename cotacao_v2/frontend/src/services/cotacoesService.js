import axios from 'axios';

const API_BASE_URL = '/api/cotacoes';

export const cotacoesService = {
  // Buscar todas as cotações
  getAll: async () => {
    const response = await axios.get(API_BASE_URL);
    return response.data;
  },

  // Buscar cotação por ID
  getById: async (id) => {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return response.data;
  },

  // Criar nova cotação
  create: async (cotacaoData) => {
    const response = await axios.post(API_BASE_URL, cotacaoData);
    return response.data;
  },

  // Atualizar cotação
  update: async (id, cotacaoData) => {
    const response = await axios.put(`${API_BASE_URL}/${id}`, cotacaoData);
    return response.data;
  },

  // Deletar cotação
  delete: async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/${id}`);
    return response.data;
  },

  // Enviar para supervisor
  enviarParaSupervisor: async (id) => {
    const response = await axios.post(`${API_BASE_URL}/${id}/enviar-supervisor`);
    return response.data;
  },

  // Buscar estatísticas
  getStats: async () => {
    const response = await axios.get(`${API_BASE_URL}/stats/overview`);
    return response.data;
  },

  // Buscar cotações pendentes para supervisor
  getPendentesSupervisor: async () => {
    const response = await axios.get(`${API_BASE_URL}/pendentes-supervisor`);
    return response.data;
  },

  // Buscar aprovações
  getAprovacoes: async () => {
    const response = await axios.get(`${API_BASE_URL}/aprovacoes`);
    return response.data;
  }
};

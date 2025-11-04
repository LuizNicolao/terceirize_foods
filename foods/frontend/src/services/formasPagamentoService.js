import api from './api';

const formasPagamentoService = {
  listar: async (filtros = {}) => {
    const response = await api.get('/formas-pagamento', { params: filtros });
    return response.data;
  },

  buscarPorId: async (id) => {
    const response = await api.get(`/formas-pagamento/${id}`);
    return response.data;
  },

  buscarAtivas: async () => {
    const response = await api.get('/formas-pagamento/ativas');
    return response.data;
  },

  criar: async (dados) => {
    const response = await api.post('/formas-pagamento', dados);
    return response.data;
  },

  atualizar: async (id, dados) => {
    const response = await api.put(`/formas-pagamento/${id}`, dados);
    return response.data;
  },

  excluir: async (id) => {
    const response = await api.delete(`/formas-pagamento/${id}`);
    return response.data;
  }
};

export default formasPagamentoService;


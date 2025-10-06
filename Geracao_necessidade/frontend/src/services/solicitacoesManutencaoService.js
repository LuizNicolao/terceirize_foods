import api from './api';

const solicitacoesManutencaoService = {
  // Listar solicitações com filtros
  listar: async (filtros = {}) => {
    const params = new URLSearchParams();
    
    Object.keys(filtros).forEach(key => {
      if (filtros[key] !== undefined && filtros[key] !== '' && filtros[key] !== null) {
        let value = filtros[key];
        
        // Tratar objetos complexos
        if (key === 'escola' && typeof value === 'object' && value && value.id) {
          value = value.id;
        }
        
        params.append(key, value);
      }
    });

    const url = `/solicitacoes-manutencao?${params.toString()}`;
    
    const response = await api.get(url);
    return response.data;
  },

  // Listar todas as solicitações (sem paginação)
  listarTodas: async (filtros = {}) => {
    const params = new URLSearchParams();
    
    Object.keys(filtros).forEach(key => {
      if (filtros[key] !== undefined && filtros[key] !== '' && filtros[key] !== null) {
        let value = filtros[key];
        
        if (key === 'escola' && typeof value === 'object' && value && value.id) {
          value = value.id;
        }
        
        params.append(key, value);
      }
    });

    const response = await api.get(`/solicitacoes-manutencao/todas?${params.toString()}`);
    return response.data;
  },

  // Buscar solicitação por ID
  buscarPorId: async (id) => {
    const response = await api.get(`/solicitacoes-manutencao/${id}`);
    return response.data;
  },

  // Criar nova solicitação
  criar: async (dados) => {
    const response = await api.post('/solicitacoes-manutencao', dados);
    return response.data;
  },

  // Atualizar solicitação
  atualizar: async (id, dados) => {
    const response = await api.put(`/solicitacoes-manutencao/${id}`, dados);
    return response.data;
  },

  // Deletar solicitação
  deletar: async (id) => {
    const response = await api.delete(`/solicitacoes-manutencao/${id}`);
    return response.data;
  },

  // Obter estatísticas
  obterEstatisticas: async (filtros = {}) => {
    const params = new URLSearchParams();
    
    Object.keys(filtros).forEach(key => {
      if (filtros[key] !== undefined && filtros[key] !== '' && filtros[key] !== null) {
        params.append(key, filtros[key]);
      }
    });

    const response = await api.get(`/solicitacoes-manutencao/stats/estatisticas?${params.toString()}`);
    return response.data;
  },

  // Obter resumo
  obterResumo: async () => {
    const response = await api.get('/solicitacoes-manutencao/resumo');
    return response.data;
  },

  // Upload de foto
  uploadFoto: async (file) => {
    const formData = new FormData();
    formData.append('foto', file);
    
    const response = await api.post('/upload/foto-equipamento', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};

export default solicitacoesManutencaoService;

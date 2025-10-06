import api from './api';

const necessidadesService = {
  // Listar necessidades com filtros
  listar: async (filtros = {}) => {
    const params = new URLSearchParams();
    
    Object.keys(filtros).forEach(key => {
      if (filtros[key] !== undefined && filtros[key] !== '' && filtros[key] !== null) {
        let value = filtros[key];
        
        // Tratar objetos complexos
        if (key === 'escola' && typeof value === 'object' && value && value.nome_escola) {
          value = value.nome_escola;
        } else if (key === 'grupo' && typeof value === 'object' && value && value.id) {
          value = value.id;
        }
        
        params.append(key, value);
      }
    });

    const response = await api.get(`/necessidades?${params.toString()}`);
    return response.data;
  },

  // Buscar necessidade por ID
  buscarPorId: async (id) => {
    const response = await api.get(`/necessidades/${id}`);
    return response.data;
  },

  // Criar nova necessidade
  criar: async (dados) => {
    const response = await api.post('/necessidades', dados);
    return response.data;
  },

  // Atualizar necessidade
  atualizar: async (id, dados) => {
    const response = await api.put(`/necessidades/${id}`, dados);
    return response.data;
  },

  // Deletar necessidade
  deletar: async (id) => {
    const response = await api.delete(`/necessidades/${id}`);
    return response.data;
  },

  // Gerar necessidade (nova funcionalidade)
  gerarNecessidade: async (dados) => {
    const response = await api.post('/necessidades/gerar', dados);
    return response.data;
  },

  // Buscar produtos por grupo
  buscarProdutosPorGrupo: async (grupoId) => {
    const response = await api.get(`/produtos/grupo/${grupoId}`);
    return response.data;
  },

  // Buscar percapita de produtos
  buscarPercapitaProdutos: async (produtoIds) => {
    const response = await api.post('/produtos-per-capita/buscar-por-produtos', { produtoIds });
    return response.data;
  },

  // Calcular médias por período
  calcularMediasPorPeriodo: async (escolaId, data) => {
    const response = await api.get(`/registros-diarios/medias-periodo?escola_id=${escolaId}&data=${data}`);
    return response.data;
  },

  // Buscar grupos de produtos
  buscarGrupos: async () => {
    const response = await api.get('/produtos/grupos');
    return response.data;
  }
};

export default necessidadesService;

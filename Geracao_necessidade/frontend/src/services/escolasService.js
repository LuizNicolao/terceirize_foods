import api from './api';

const escolasService = {
  // Listar escolas com filtros (com permissões por nutricionista)
  listar: async (filtros = {}) => {
    const params = new URLSearchParams();
    
    Object.keys(filtros).forEach(key => {
      if (filtros[key] !== undefined && filtros[key] !== '') {
        params.append(key, filtros[key]);
      }
    });

    const url = `/escolas?${params.toString()}`;

    // Usar a rota de escolas que respeita as permissões por nutricionista
    const response = await api.get(url);
    return response.data;
  },

  // Listar todas as escolas (sem filtro de permissão por nutricionista)
  listarTodas: async (filtros = {}) => {
    const params = new URLSearchParams();
    
    Object.keys(filtros).forEach(key => {
      if (filtros[key] !== undefined && filtros[key] !== '') {
        params.append(key, filtros[key]);
      }
    });

    const url = `/escolas/todas?${params.toString()}`;

    // Usar a rota de escolas que retorna todas as escolas (para Coordenador/Supervisor)
    const response = await api.get(url);
    return response.data;
  },

  // Buscar escola por ID
  buscarPorId: async (id) => {
    const response = await api.get(`/escolas/${id}`);
    return response.data;
  },

  // Criar nova escola
  criar: async (dados) => {
    const response = await api.post('/escolas', dados);
    return response.data;
  },

  // Atualizar escola
  atualizar: async (id, dados) => {
    const response = await api.put(`/escolas/${id}`, dados);
    return response.data;
  },

  // Deletar escola
  deletar: async (id) => {
    const response = await api.delete(`/escolas/${id}`);
    return response.data;
  }
};

export default escolasService;

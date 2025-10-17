import api from './api';
import FoodsApiService from './FoodsApiService';

const escolasService = {
  // Listar escolas com filtros (busca do Foods)
  listar: async (filtros = {}) => {
    try {
      // Buscar escolas do sistema Foods via FoodsApiService
      const response = await FoodsApiService.getUnidadesEscolares({ ativo: true, ...filtros });
      
      if (response.success) {
        // Mapear dados do Foods para o formato esperado
        const escolasFormatadas = (response.data || []).map(escola => ({
          id: escola.id,
          nome_escola: escola.nome,
          rota: escola.rota || '',
          codigo_teknisa: escola.codigo_teknisa || escola.codigo || '',
          cidade: escola.cidade || '',
          ativo: escola.ativo
        }));
        
        return {
          success: true,
          data: escolasFormatadas
        };
      }
      
      return response;
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error.response?.data?.message || 'Erro ao carregar escolas'
      };
    }
  },

  // Listar todas as escolas (mesmo que listar - Foods não tem filtro de nutricionista)
  listarTodas: async (filtros = {}) => {
    return await escolasService.listar(filtros);
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

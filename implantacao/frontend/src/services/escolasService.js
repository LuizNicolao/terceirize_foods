import api from './api';
import FoodsApiService from './FoodsApiService';

const escolasService = {
  // Listar escolas com filtros (usando endpoint específico para necessidades)
  listar: async (filtros = {}, user = null) => {
    try {
      const possuiFiltrosAvancados = Boolean(
        filtros &&
        (
          filtros.filial_id !== undefined ||
          filtros.search ||
          filtros.page ||
          filtros.limit ||
          filtros.rota_id
        )
      );

      // Usar endpoint específico de necessidades (igual ao recebimentos-escolas)
      if (user && user.id && !possuiFiltrosAvancados) {
        const response = await api.get(`/necessidades/escolas-nutricionista/${user.id}`);
        if (response.data && response.data.success) {
          return {
            success: true,
            data: response.data.data || []
          };
        }
      }
      
      // Fallback: buscar todas as escolas do Foods
      const response = await FoodsApiService.getUnidadesEscolares({ ativo: true, ...filtros });
      
      if (!response.success) {
        return response;
      }
      
      // Mapear dados do Foods para o formato esperado
      const escolasFormatadas = (response.data || []).map(escola => ({
        id: escola.id,
        nome_escola: escola.nome_escola || escola.nome,
        rota: escola.rota_nome || escola.rota || '',
        codigo_teknisa: escola.codigo_teknisa || escola.codigo || '',
        cidade: escola.cidade || '',
        ativo: escola.ativo
      }));
      
      return {
        success: true,
        data: escolasFormatadas,
        pagination: response.pagination
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error.response?.data?.message || 'Erro ao carregar escolas'
      };
    }
  },

  // Listar todas as escolas (com filtro por nutricionista se aplicável)
  listarTodas: async (filtros = {}, user = null) => {
    return await escolasService.listar(filtros, user);
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

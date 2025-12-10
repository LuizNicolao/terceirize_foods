import api from './api';

/**
 * Service para Períodos de Atendimento
 * Gerencia comunicação com a API de períodos de atendimento
 */
const periodosAtendimentoService = {
  /**
   * Listar períodos de atendimento com filtros e paginação
   */
  async listar(params = {}) {
    try {
      const response = await api.get('/periodos-atendimento', { params });
      
      // O backend retorna: { success: true, data: { items: [...], pagination: {...} } }
      const responseData = response.data?.data || response.data || {};
      
      // Extrair items e pagination
      let items = [];
      if (Array.isArray(responseData)) {
        items = responseData;
      } else if (responseData.items && Array.isArray(responseData.items)) {
        items = responseData.items;
      } else if (Array.isArray(responseData.data)) {
        items = responseData.data;
      }
      
      const paginationData = responseData.pagination || response.data?.pagination || null;
      
      // Normalizar dados de paginação para o formato esperado pelo frontend
      const normalizedPagination = paginationData ? {
        currentPage: paginationData.page || paginationData.currentPage || 1,
        totalPages: paginationData.totalPages || 1,
        totalItems: paginationData.total || paginationData.totalItems || 0,
        itemsPerPage: paginationData.limit || paginationData.itemsPerPage || 20
      } : null;
      
      return {
        success: true,
        data: items,
        pagination: normalizedPagination,
        links: response.data?.links || null
      };
    } catch (error) {
      console.error('Erro ao listar períodos de atendimento:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao listar períodos de atendimento',
        data: []
      };
    }
  },

  /**
   * Buscar período de atendimento por ID
   */
  async buscarPorId(id) {
    try {
      const response = await api.get(`/periodos-atendimento/${id}`);
      return {
        success: true,
        data: response.data?.data || response.data || null
      };
    } catch (error) {
      console.error('Erro ao buscar período de atendimento:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar período de atendimento',
        data: null
      };
    }
  },

  /**
   * Buscar unidades vinculadas a um período
   */
  async buscarUnidadesVinculadas(id, includeInactive = false) {
    try {
      const response = await api.get(`/periodos-atendimento/${id}/unidades`, {
        params: {
          include_inactive: includeInactive ? 'true' : 'false'
        }
      });
      return {
        success: true,
        data: response.data?.data || response.data || []
      };
    } catch (error) {
      console.error('Erro ao buscar unidades vinculadas:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar unidades vinculadas',
        data: []
      };
    }
  },

  /**
   * Buscar todos os períodos vinculados a uma lista de unidades
   */
  async buscarPeriodosPorUnidades(unidadesIds, includeInactive = false) {
    try {
      // Garantir que seja um array
      const idsArray = Array.isArray(unidadesIds) ? unidadesIds : [unidadesIds];
      
      // Converter para números e filtrar inválidos
      const idsNumericos = idsArray.map(id => parseInt(id)).filter(id => !isNaN(id) && id > 0);
      
      if (idsNumericos.length === 0) {
        return {
          success: false,
          error: 'Nenhum ID de unidade válido fornecido',
          data: { vinculos: {}, periodos: [] }
        };
      }
      
      // Enviar como array no formato que o backend espera
      const response = await api.get('/periodos-atendimento/periodos-por-unidades', {
        params: {
          unidades_ids: idsNumericos,
          include_inactive: includeInactive ? 'true' : 'false'
        },
        paramsSerializer: {
          indexes: null // Envia como unidades_ids=1&unidades_ids=2&unidades_ids=3
        }
      });
      
      const responseData = response.data?.data || response.data || {};
      
      return {
        success: true,
        data: responseData
      };
    } catch (error) {
      console.error('Erro ao buscar períodos por unidades:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar períodos por unidades',
        data: { vinculos: {}, periodos: [] }
      };
    }
  },

  /**
   * Criar novo período de atendimento
   */
  async criar(dados) {
    try {
      const response = await api.post('/periodos-atendimento', dados);
      return {
        success: true,
        data: response.data?.data || response.data || null,
        message: response.data?.message || 'Período de atendimento criado com sucesso'
      };
    } catch (error) {
      console.error('Erro ao criar período de atendimento:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          (error.response?.data?.errors ? JSON.stringify(error.response.data.errors) : null) ||
                          'Erro ao criar período de atendimento';
      return {
        success: false,
        error: errorMessage,
        data: null
      };
    }
  },

  /**
   * Atualizar período de atendimento
   */
  async atualizar(id, dados) {
    try {
      const response = await api.put(`/periodos-atendimento/${id}`, dados);
      return {
        success: true,
        data: response.data?.data || response.data || null,
        message: response.data?.message || 'Período de atendimento atualizado com sucesso'
      };
    } catch (error) {
      console.error('Erro ao atualizar período de atendimento:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao atualizar período de atendimento',
        data: null
      };
    }
  },

  /**
   * Vincular unidades a um período de atendimento
   */
  async vincularUnidades(id, cozinha_industrial_ids) {
    try {
      // Garantir que cozinha_industrial_ids seja um array de números
      const idsArray = Array.isArray(cozinha_industrial_ids) 
        ? cozinha_industrial_ids.map(id => parseInt(id, 10)).filter(id => !isNaN(id) && id > 0)
        : [];
      
      // Permitir array vazio para remover todos os vínculos
      // O backend agora aceita array vazio e remove todos os vínculos
      
      const response = await api.post(`/periodos-atendimento/${id}/vincular-unidades`, {
        cozinha_industrial_ids: idsArray
      });
      return {
        success: true,
        data: response.data?.data || response.data || null,
        message: response.data?.message || (idsArray.length === 0 ? 'Vínculos removidos com sucesso' : 'Unidades vinculadas com sucesso')
      };
    } catch (error) {
      console.error('Erro ao vincular unidades:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Erro ao vincular unidades';
      return {
        success: false,
        error: errorMessage,
        data: null
      };
    }
  },

  /**
   * Desvincular unidade de um período
   */
  async desvincularUnidade(id, unidadeId) {
    try {
      const response = await api.delete(`/periodos-atendimento/${id}/desvincular-unidade/${unidadeId}`);
      return {
        success: true,
        message: response.data?.message || 'Unidade desvinculada com sucesso'
      };
    } catch (error) {
      console.error('Erro ao desvincular unidade:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao desvincular unidade'
      };
    }
  },

  /**
   * Excluir período de atendimento
   */
  async excluir(id) {
    try {
      const response = await api.delete(`/periodos-atendimento/${id}`);
      return {
        success: true,
        message: response.data?.message || 'Período de atendimento excluído com sucesso'
      };
    } catch (error) {
      console.error('Erro ao excluir período de atendimento:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao excluir período de atendimento'
      };
    }
  },

  /**
   * Exportar períodos de atendimento em JSON
   */
  async exportarJson() {
    try {
      const response = await api.get('/periodos-atendimento/exportar/json');
      return {
        success: true,
        data: response.data?.data || response.data || []
      };
    } catch (error) {
      console.error('Erro ao exportar períodos de atendimento:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao exportar períodos de atendimento',
        data: []
      };
    }
  }
};

export default periodosAtendimentoService;


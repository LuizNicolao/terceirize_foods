import api from './api';

/**
 * Service para Cardápios
 * Gerencia comunicação com a API de cardápios
 */
const cardapiosService = {
  /**
   * Listar cardápios com filtros e paginação
   */
  async listar(params = {}) {
    try {
      const response = await api.get('/cardapios', { params });
      
      const responseData = response.data?.data || response.data || {};
      
      let items = [];
      if (Array.isArray(responseData)) {
        items = responseData;
      } else if (responseData.items && Array.isArray(responseData.items)) {
        items = responseData.items;
      } else if (Array.isArray(responseData.data)) {
        items = responseData.data;
      }
      
      const paginationData = responseData.pagination || response.data?.pagination || null;
      
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
      console.error('Erro ao listar cardápios:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao listar cardápios',
        data: []
      };
    }
  },

  /**
   * Buscar cardápio por ID
   */
  async buscarPorId(id) {
    try {
      const response = await api.get(`/cardapios/${id}`);
      return {
        success: true,
        data: response.data?.data || response.data || null
      };
    } catch (error) {
      console.error('Erro ao buscar cardápio:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar cardápio',
        data: null
      };
    }
  },

  /**
   * Criar novo cardápio
   */
  async criar(dados) {
    try {
      const response = await api.post('/cardapios', dados);
      return {
        success: true,
        data: response.data?.data || response.data || null,
        message: response.data?.message || 'Cardápio criado com sucesso'
      };
    } catch (error) {
      console.error('Erro ao criar cardápio:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao criar cardápio',
        data: null
      };
    }
  },

  /**
   * Atualizar cardápio
   */
  async atualizar(id, dados) {
    try {
      const response = await api.put(`/cardapios/${id}`, dados);
      return {
        success: true,
        data: response.data?.data || response.data || null,
        message: response.data?.message || 'Cardápio atualizado com sucesso'
      };
    } catch (error) {
      console.error('Erro ao atualizar cardápio:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao atualizar cardápio',
        data: null
      };
    }
  },

  /**
   * Excluir cardápio
   */
  async excluir(id) {
    try {
      const response = await api.delete(`/cardapios/${id}`);
      return {
        success: true,
        message: response.data?.message || 'Cardápio excluído com sucesso'
      };
    } catch (error) {
      console.error('Erro ao excluir cardápio:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao excluir cardápio'
      };
    }
  },

  /**
   * Exportar cardápios em JSON
   */
  async exportarJSON(params = {}) {
    try {
      const response = await api.get('/cardapios/exportar/json', { params });
      return {
        success: true,
        data: response.data?.data || response.data || []
      };
    } catch (error) {
      console.error('Erro ao exportar cardápios:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao exportar cardápios',
        data: []
      };
    }
  }
};

export default cardapiosService;


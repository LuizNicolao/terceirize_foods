import api from './api';

/**
 * Service para Pratos
 * Gerencia comunicação com a API de pratos
 */
const pratosService = {
  /**
   * Listar pratos com filtros e paginação
   */
  async listar(params = {}) {
    try {
      const response = await api.get('/pratos', { params });
      const paginationData = response.data?.data?.pagination || response.data?.pagination || null;
      
      // Normalizar dados de paginação para o formato esperado pelo frontend
      const normalizedPagination = paginationData ? {
        currentPage: paginationData.page || paginationData.currentPage || 1,
        totalPages: paginationData.totalPages || 1,
        totalItems: paginationData.total || paginationData.totalItems || 0,
        itemsPerPage: paginationData.limit || paginationData.itemsPerPage || 20
      } : null;
      
      return {
        success: true,
        data: response.data?.data?.items || response.data?.data || response.data || [],
        pagination: normalizedPagination,
        links: response.data?.links || null
      };
    } catch (error) {
      console.error('Erro ao listar pratos:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao listar pratos',
        data: []
      };
    }
  },

  /**
   * Buscar prato por ID
   */
  async buscarPorId(id) {
    try {
      const response = await api.get(`/pratos/${id}`);
      return {
        success: true,
        data: response.data?.data || response.data || null
      };
    } catch (error) {
      console.error('Erro ao buscar prato:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar prato',
        data: null
      };
    }
  },

  /**
   * Criar novo prato
   */
  async criar(dados) {
    try {
      const response = await api.post('/pratos', dados);
      return {
        success: true,
        data: response.data?.data || response.data || null,
        message: response.data?.message || 'Prato criado com sucesso'
      };
    } catch (error) {
      console.error('Erro ao criar prato:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao criar prato',
        data: null
      };
    }
  },

  /**
   * Atualizar prato
   */
  async atualizar(id, dados) {
    try {
      const response = await api.put(`/pratos/${id}`, dados);
      return {
        success: true,
        data: response.data?.data || response.data || null,
        message: response.data?.message || 'Prato atualizado com sucesso'
      };
    } catch (error) {
      console.error('Erro ao atualizar prato:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao atualizar prato',
        data: null
      };
    }
  },

  /**
   * Excluir prato
   */
  async excluir(id) {
    try {
      const response = await api.delete(`/pratos/${id}`);
      return {
        success: true,
        message: response.data?.message || 'Prato excluído com sucesso'
      };
    } catch (error) {
      console.error('Erro ao excluir prato:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao excluir prato'
      };
    }
  },

  /**
   * Exportar pratos em JSON
   */
  async exportarJson() {
    try {
      const response = await api.get('/pratos/exportar/json');
      return {
        success: true,
        data: response.data?.data || response.data || []
      };
    } catch (error) {
      console.error('Erro ao exportar pratos:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao exportar pratos',
        data: []
      };
    }
  }
};

export default pratosService;


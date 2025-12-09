import api from './api';

/**
 * Service para Tipos de Pratos
 * Gerencia comunicação com a API de tipos de pratos
 */
const tiposPratosService = {
  /**
   * Listar tipos de pratos com filtros e paginação
   */
  async listar(params = {}) {
    try {
      const response = await api.get('/tipos-pratos', { params });
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
      console.error('Erro ao listar tipos de pratos:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao listar tipos de pratos',
        data: []
      };
    }
  },

  /**
   * Buscar tipo de prato por ID
   */
  async buscarPorId(id) {
    try {
      const response = await api.get(`/tipos-pratos/${id}`);
      return {
        success: true,
        data: response.data?.data || response.data || null
      };
    } catch (error) {
      console.error('Erro ao buscar tipo de prato:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar tipo de prato',
        data: null
      };
    }
  },

  /**
   * Criar novo tipo de prato
   */
  async criar(dados) {
    try {
      const response = await api.post('/tipos-pratos', dados);
      return {
        success: true,
        data: response.data?.data || response.data || null,
        message: response.data?.message || 'Tipo de prato criado com sucesso'
      };
    } catch (error) {
      console.error('Erro ao criar tipo de prato:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao criar tipo de prato',
        data: null
      };
    }
  },

  /**
   * Atualizar tipo de prato
   */
  async atualizar(id, dados) {
    try {
      const response = await api.put(`/tipos-pratos/${id}`, dados);
      return {
        success: true,
        data: response.data?.data || response.data || null,
        message: response.data?.message || 'Tipo de prato atualizado com sucesso'
      };
    } catch (error) {
      console.error('Erro ao atualizar tipo de prato:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao atualizar tipo de prato',
        data: null
      };
    }
  },

  /**
   * Excluir tipo de prato
   */
  async excluir(id) {
    try {
      const response = await api.delete(`/tipos-pratos/${id}`);
      return {
        success: true,
        message: response.data?.message || 'Tipo de prato excluído com sucesso'
      };
    } catch (error) {
      console.error('Erro ao excluir tipo de prato:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao excluir tipo de prato'
      };
    }
  },

  /**
   * Exportar tipos de pratos em JSON
   */
  async exportarJson() {
    try {
      const response = await api.get('/tipos-pratos/exportar/json');
      return {
        success: true,
        data: response.data?.data || response.data || []
      };
    } catch (error) {
      console.error('Erro ao exportar tipos de pratos:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao exportar tipos de pratos',
        data: []
      };
    }
  }
};

export default tiposPratosService;


import api from './api';

/**
 * Service para Tipos de Receitas
 * Gerencia comunicação com a API de tipos de receitas
 */
const tiposReceitasService = {
  /**
   * Listar tipos de receitas com filtros e paginação
   */
  async listar(params = {}) {
    try {
      const response = await api.get('/tipos-receitas', { params });
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
      console.error('Erro ao listar tipos de receitas:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao listar tipos de receitas',
        data: []
      };
    }
  },

  /**
   * Buscar tipo de receita por ID
   */
  async buscarPorId(id) {
    try {
      const response = await api.get(`/tipos-receitas/${id}`);
      return {
        success: true,
        data: response.data?.data || response.data || null
      };
    } catch (error) {
      console.error('Erro ao buscar tipo de receita:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar tipo de receita',
        data: null
      };
    }
  },

  /**
   * Criar novo tipo de receita
   */
  async criar(dados) {
    try {
      const response = await api.post('/tipos-receitas', dados);
      return {
        success: true,
        data: response.data?.data || response.data || null,
        message: response.data?.message || 'Tipo de receita criado com sucesso'
      };
    } catch (error) {
      console.error('Erro ao criar tipo de receita:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao criar tipo de receita',
        data: null
      };
    }
  },

  /**
   * Atualizar tipo de receita
   */
  async atualizar(id, dados) {
    try {
      const response = await api.put(`/tipos-receitas/${id}`, dados);
      return {
        success: true,
        data: response.data?.data || response.data || null,
        message: response.data?.message || 'Tipo de receita atualizado com sucesso'
      };
    } catch (error) {
      console.error('Erro ao atualizar tipo de receita:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao atualizar tipo de receita',
        data: null
      };
    }
  },

  /**
   * Excluir tipo de receita
   */
  async excluir(id) {
    try {
      const response = await api.delete(`/tipos-receitas/${id}`);
      return {
        success: true,
        message: response.data?.message || 'Tipo de receita excluído com sucesso'
      };
    } catch (error) {
      console.error('Erro ao excluir tipo de receita:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao excluir tipo de receita'
      };
    }
  },

  /**
   * Exportar tipos de receitas em JSON
   */
  async exportarJson() {
    try {
      const response = await api.get('/tipos-receitas/exportar/json');
      return {
        success: true,
        data: response.data?.data || response.data || []
      };
    } catch (error) {
      console.error('Erro ao exportar tipos de receitas:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao exportar tipos de receitas',
        data: []
      };
    }
  }
};

export default tiposReceitasService;


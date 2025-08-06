import api from './api';

const MarcasService = {
  // Listar marcas com paginação
  async listar(params = {}) {
    try {
      const response = await api.get('/marcas', { params });
      const data = response.data.data || response.data || [];
      return {
        success: true,
        data: Array.isArray(data) ? data : [],
        pagination: response.data.pagination || null
      };
    } catch (error) {
      console.error('Erro ao listar marcas:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar marcas'
      };
    }
  },

  // Buscar marca por ID
  async buscarPorId(id) {
    try {
      const response = await api.get(`/marcas/${id}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Erro ao buscar marca:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar marca'
      };
    }
  },

  // Criar nova marca
  async criar(data) {
    try {
      const response = await api.post('/marcas', data);
      return {
        success: true,
        data: response.data.data,
        message: 'Marca criada com sucesso'
      };
    } catch (error) {
      console.error('Erro ao criar marca:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao criar marca'
      };
    }
  },

  // Atualizar marca
  async atualizar(id, data) {
    try {
      const response = await api.put(`/marcas/${id}`, data);
      return {
        success: true,
        data: response.data.data,
        message: 'Marca atualizada com sucesso'
      };
    } catch (error) {
      console.error('Erro ao atualizar marca:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao atualizar marca'
      };
    }
  },

  // Excluir/desativar marca
  async excluir(id) {
    try {
      const response = await api.delete(`/marcas/${id}`);
      return {
        success: true,
        message: 'Marca excluída com sucesso'
      };
    } catch (error) {
      console.error('Erro ao excluir marca:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao excluir marca'
      };
    }
  },

  // Buscar marcas (para dropdowns)
  async buscar() {
    try {
      const response = await api.get('/marcas');
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      console.error('Erro ao buscar marcas:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar marcas'
      };
    }
  },

  // Obter estatísticas
  async getEstatisticas() {
    try {
      const response = await api.get('/marcas/stats');
      return {
        success: true,
        data: response.data.data || {}
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas das marcas:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao obter estatísticas'
      };
    }
  },

  // Obter logs de auditoria
  async getAuditLogs(filters = {}) {
    try {
      const response = await api.get('/marcas/audit', { params: filters });
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      console.error('Erro ao obter logs de auditoria:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao obter logs de auditoria'
      };
    }
  },

  // Exportar dados
  async exportar(formato, filters = {}) {
    try {
      const response = await api.get(`/marcas/export/${formato}`, { 
        params: filters,
        responseType: 'blob'
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erro ao exportar marcas:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao exportar dados'
      };
    }
  }
};

export default MarcasService; 
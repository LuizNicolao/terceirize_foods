import api from './api';

class SubgruposService {
  /**
   * Listar subgrupos com paginação e filtros
   */
  static async listar(params = {}) {
    try {
      const response = await api.get('/subgrupos', { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao listar subgrupos:', error);
      throw error;
    }
  }

  /**
   * Buscar subgrupo por ID
   */
  static async buscarPorId(id) {
    try {
      const response = await api.get(`/subgrupos/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar subgrupo:', error);
      throw error;
    }
  }

  /**
   * Criar novo subgrupo
   */
  static async criar(data) {
    try {
      const response = await api.post('/subgrupos', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar subgrupo:', error);
      throw error;
    }
  }

  /**
   * Atualizar subgrupo
   */
  static async atualizar(id, data) {
    try {
      const response = await api.put(`/subgrupos/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar subgrupo:', error);
      throw error;
    }
  }

  /**
   * Excluir subgrupo
   */
  static async excluir(id) {
    try {
      const response = await api.delete(`/subgrupos/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao excluir subgrupo:', error);
      throw error;
    }
  }

  /**
   * Buscar subgrupos ativos
   */
  static async buscarAtivos(params = {}) {
    try {
      const response = await api.get('/subgrupos/ativos', { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar subgrupos ativos:', error);
      throw error;
    }
  }

  /**
   * Buscar subgrupos por grupo
   */
  static async buscarPorGrupo(grupoId, params = {}) {
    try {
      const response = await api.get(`/grupos/${grupoId}/subgrupos`, { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar subgrupos por grupo:', error);
      throw error;
    }
  }

  /**
   * Exportar subgrupos para XLSX
   */
  static async exportarXLSX(params = {}) {
    try {
      const response = await api.get('/subgrupos/export/xlsx', { 
        params,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao exportar subgrupos para XLSX:', error);
      throw error;
    }
  }

  /**
   * Exportar subgrupos para PDF
   */
  static async exportarPDF(params = {}) {
    try {
      const response = await api.get('/subgrupos/export/pdf', { 
        params,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao exportar subgrupos para PDF:', error);
      throw error;
    }
  }
}

export default SubgruposService; 
import api from './api';

const consultaStatusNecessidadeService = {
  /**
   * Listar status das necessidades com filtros e paginação
   */
  async listar(filtros = {}) {
    try {
      const params = new URLSearchParams();
      
      // Adicionar filtros aos parâmetros da query
      Object.keys(filtros).forEach(key => {
        if (filtros[key] !== null && filtros[key] !== undefined && filtros[key] !== '') {
          params.append(key, filtros[key]);
        }
      });

      const response = await api.get(`/consulta-status-necessidade?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao listar status das necessidades:', error);
      throw error;
    }
  },

  /**
   * Obter estatísticas gerais das necessidades
   */
  async obterEstatisticas(filtros = {}) {
    try {
      const params = new URLSearchParams();
      
      // Adicionar filtros aos parâmetros da query
      Object.keys(filtros).forEach(key => {
        if (filtros[key] !== null && filtros[key] !== undefined && filtros[key] !== '') {
          params.append(key, filtros[key]);
        }
      });

      const response = await api.get(`/consulta-status-necessidade/estatisticas?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      throw error;
    }
  },

  /**
   * Exportar dados para XLSX
   */
  async exportarXLSX(filtros = {}) {
    try {
      const params = new URLSearchParams();
      
      // Adicionar filtros aos parâmetros da query
      Object.keys(filtros).forEach(key => {
        if (filtros[key] !== null && filtros[key] !== undefined && filtros[key] !== '') {
          params.append(key, filtros[key]);
        }
      });

      const response = await api.get(`/consulta-status-necessidade/exportar/xlsx?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao exportar XLSX:', error);
      throw error;
    }
  },

  /**
   * Exportar dados para PDF
   */
  async exportarPDF(filtros = {}) {
    try {
      const params = new URLSearchParams();
      
      // Adicionar filtros aos parâmetros da query
      Object.keys(filtros).forEach(key => {
        if (filtros[key] !== null && filtros[key] !== undefined && filtros[key] !== '') {
          params.append(key, filtros[key]);
        }
      });

      const response = await api.get(`/consulta-status-necessidade/exportar/pdf?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      throw error;
    }
  }
};

export default consultaStatusNecessidadeService;

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

      const url = `/consulta-status-necessidade?${params.toString()}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
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
      throw error;
    }
  },

  /**
   * Obter opções de filtros disponíveis baseadas nos dados reais
   */
  async obterOpcoesFiltros() {
    try {
      const response = await api.get('/consulta-status-necessidade/opcoes-filtros');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Buscar produtos de um grupo específico com detalhes
   */
  async buscarProdutosPorGrupo(filtros = {}) {
    try {
      const params = new URLSearchParams();
      
      Object.keys(filtros).forEach(key => {
        const value = filtros[key];
        if (value !== null && value !== undefined && value !== '') {
          // Garantir que o valor seja uma string
          params.append(key, String(value));
        }
      });

      const url = `/consulta-status-necessidade/produtos-por-grupo?${params.toString()}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar produtos por grupo:', error);
      console.error('Filtros enviados:', filtros);
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
      throw error;
    }
  },

  /**
   * Listar comparação NEC x CONF (ajuste vs ajuste_conf_coord)
   */
  async listarNecVsConf(filtros = {}) {
    try {
      const params = new URLSearchParams();
      
      Object.keys(filtros).forEach(key => {
        const value = filtros[key];
        if (value !== null && value !== undefined && value !== '') {
          params.append(key, String(value));
        }
      });

      const url = `/consulta-status-necessidade/nec-vs-conf?${params.toString()}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default consultaStatusNecessidadeService;

import api from './api';

export const aprovacoesService = {
  // Buscar todas as aprovações
  async getAprovacoes(params = '') {
    const response = await api.get(`/aprovacoes${params ? `?${params}` : ''}`);
    return response.data.data || response.data; // Extrair dados da estrutura padronizada
  },

  // Buscar aprovação por ID
  async getAprovacao(id) {
    const response = await api.get(`/aprovacoes/${id}`);
    return response.data.data || response.data; // Extrair dados da estrutura padronizada
  },

  // Buscar cotação específica para aprovação
  async fetchCotacao(id) {
    const response = await api.get(`/cotacoes/${id}`);
    return response.data.data || response.data; // Extrair dados da estrutura padronizada
  },

  // Aprovar cotação
  async aprovarCotacao(id, data) {
    const response = await api.post(`/aprovacoes/${id}/aprovar`, data);
    return response.data.data || response.data; // Extrair dados da estrutura padronizada
  },

  // Rejeitar cotação
  async rejeitarCotacao(id, data) {
    const response = await api.post(`/aprovacoes/${id}/rejeitar`, data);
    return response.data.data || response.data; // Extrair dados da estrutura padronizada
  },

  // Renegociar cotação
  async renegociarCotacao(id, data) {
    const response = await api.post(`/aprovacoes/${id}/renegociar`, data);
    return response.data.data || response.data; // Extrair dados da estrutura padronizada
  },

  // Buscar estatísticas
  async getStats() {
    const response = await api.get('/aprovacoes/stats/overview');
    return response.data.data || response.data; // Extrair dados da estrutura padronizada
  },

  // Exportar para XLSX
  async exportXLSX(params = '') {
    const response = await api.get(`/aprovacoes/export/xlsx${params ? `?${params}` : ''}`, {
      responseType: 'blob'
    });
    return response.data.data || response.data; // Extrair dados da estrutura padronizada
  },

  // Exportar para PDF
  async exportPDF(params = '') {
    const response = await api.get(`/aprovacoes/export/pdf${params ? `?${params}` : ''}`, {
      responseType: 'blob'
    });
    return response.data.data || response.data; // Extrair dados da estrutura padronizada
  }
};

export default aprovacoesService;

import api from './api';

export const auditoriaService = {
  // Teste simples
  async testSimple() {
    const response = await api.get('/auditoria/simple');
    return response.data.data || response.data;
  },

  // Teste do banco
  async testDB() {
    const response = await api.get('/auditoria/test-db');
    return response.data;
  },

  // Buscar logs de auditoria
  async getLogs(filters = {}) {
    const response = await api.get('/auditoria', { params: filters });
    return response.data.data || response.data; // Extrair dados da estrutura padronizada
  },

  // Buscar estatísticas de auditoria
  async getStats(filters = {}) {
    const response = await api.get('/auditoria/stats', { params: filters });
    return response.data.data || response.data; // Extrair dados da estrutura padronizada
  },

  // Exportar logs em Excel
  async exportXLSX(filters = {}) {
    const response = await api.get('/auditoria/export/xlsx', {
      params: filters,
      responseType: 'blob'
    });
    return response.data;
  },

  // Exportar logs em PDF
  async exportPDF(filters = {}) {
    const response = await api.get('/auditoria/export/pdf', {
      params: filters,
      responseType: 'blob'
    });
    return response.data;
  }
};

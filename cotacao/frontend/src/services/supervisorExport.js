import api from './api';

export const supervisorExportService = {
  // Exportar análise em PDF
  async exportAnalisePDF(cotacaoId, viewMode) {
    const response = await api.get(`/supervisor/${cotacaoId}/export/pdf`, {
      params: { viewMode },
      responseType: 'blob'
    });
    return response.data.data || response.data; // Extrair dados da estrutura padronizada
  },

  // Exportar análise em Excel
  async exportAnaliseExcel(cotacaoId, viewMode) {
    const response = await api.get(`/supervisor/${cotacaoId}/export/excel`, {
      params: { viewMode },
      responseType: 'blob'
    });
    return response.data.data || response.data; // Extrair dados da estrutura padronizada
  }
};

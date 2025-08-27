/**
 * Service para Supervisor
 * Comunicação com as APIs do supervisor
 */

import api from './api';

export const supervisorService = {
  // Buscar cotações pendentes para análise
  async getCotacoesPendentes(page = 1, limit = 10) {
    const response = await api.get('/supervisor/pendentes', {
      params: { page, limit }
    });
    return response.data.data || response.data; // Extrair dados da estrutura padronizada
  },

  // Buscar estatísticas do supervisor
  async getStats() {
    const response = await api.get('/supervisor/stats');
    return response.data.data || response.data; // Extrair dados da estrutura padronizada
  },

  // Buscar detalhes de uma cotação para análise
  async getDetalhesCotacao(id) {
    const response = await api.get(`/supervisor/${id}/detalhes`);
    return response.data.data || response.data; // Extrair dados da estrutura padronizada
  },

  // Buscar cotação específica (alias para getDetalhesCotacao)
  async fetchCotacao(id) {
    const response = await api.get(`/supervisor/${id}/detalhes`);
    return response.data.data || response.data; // Extrair dados da estrutura padronizada
  },

  // Analisar cotação como supervisor
  async analisarCotacao(id, analiseData) {
    const response = await api.post(`/supervisor/${id}/analisar`, analiseData);
    return response.data.data || response.data; // Extrair dados da estrutura padronizada
  },

  // Enviar cotação para gestor
  async enviarParaGestor(id, data) {
    const response = await api.post(`/supervisor/${id}/enviar-gestor`, data);
    return response.data.data || response.data; // Extrair dados da estrutura padronizada
  },

  // Solicitar renegociação
  async solicitarRenegociacao(id, data) {
    const response = await api.post(`/cotacoes/${id}/renegociar`, data);
    return response.data.data || response.data; // Extrair dados da estrutura padronizada
  }
};

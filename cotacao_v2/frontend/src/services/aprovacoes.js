import { api } from './api';

class AprovacoesService {
  // Buscar cotações para aprovação
  async getCotacoesAprovacao() {
    try {
      const response = await api.get('/cotacoes/aprovacoes');
      
      return {
        success: true,
        data: response.data.data || response.data,
        message: 'Cotações carregadas com sucesso'
      };
    } catch (error) {
      console.error('Erro ao buscar cotações para aprovação:', error);
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Erro ao carregar cotações para aprovação'
      };
    }
  }

  // Buscar estatísticas de aprovação
  async getAprovacoesStats() {
    try {
      const response = await api.get('/cotacoes/stats/aprovacoes');
      
      return {
        success: true,
        data: response.data.data || response.data,
        message: 'Estatísticas carregadas com sucesso'
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return {
        success: false,
        data: {},
        message: error.response?.data?.message || 'Erro ao carregar estatísticas'
      };
    }
  }

  // Aprovar cotação
  async aprovarCotacao(cotacaoId, dadosAprovacao) {
    try {
      const response = await api.post(`/cotacoes/${cotacaoId}/aprovar`, dadosAprovacao);
      
      return {
        success: true,
        data: response.data.data || response.data,
        message: 'Cotação aprovada com sucesso'
      };
    } catch (error) {
      console.error('Erro ao aprovar cotação:', error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Erro ao aprovar cotação'
      };
    }
  }

  // Rejeitar cotação
  async rejeitarCotacao(cotacaoId, motivo) {
    try {
      const response = await api.post(`/cotacoes/${cotacaoId}/rejeitar`, { motivo });
      
      return {
        success: true,
        data: response.data.data || response.data,
        message: 'Cotação rejeitada com sucesso'
      };
    } catch (error) {
      console.error('Erro ao rejeitar cotação:', error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Erro ao rejeitar cotação'
      };
    }
  }

  // Enviar para supervisor
  async enviarParaSupervisor(cotacaoId) {
    try {
      const response = await api.post(`/cotacoes/${cotacaoId}/enviar-supervisor`);
      
      return {
        success: true,
        data: response.data.data || response.data,
        message: 'Cotação enviada para supervisor com sucesso'
      };
    } catch (error) {
      console.error('Erro ao enviar para supervisor:', error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Erro ao enviar para supervisor'
      };
    }
  }

  // Solicitar renegociação
  async solicitarRenegociacao(cotacaoId, observacoes) {
    try {
      const response = await api.post(`/cotacoes/${cotacaoId}/renegociar`, { observacoes });
      
      return {
        success: true,
        data: response.data.data || response.data,
        message: 'Renegociação solicitada com sucesso'
      };
    } catch (error) {
      console.error('Erro ao solicitar renegociação:', error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Erro ao solicitar renegociação'
      };
    }
  }
}

export default new AprovacoesService();

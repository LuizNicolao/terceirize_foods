import { api } from './api';

class SupervisorService {
  // Buscar cotações pendentes do supervisor
  async getCotacoesPendentes() {
    try {
      const response = await api.get('/cotacoes/pendentes-supervisor');
      
      return {
        success: true,
        data: response.data.data || response.data,
        message: 'Cotações carregadas com sucesso'
      };
    } catch (error) {
      console.error('Erro ao buscar cotações pendentes:', error);
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Erro ao carregar cotações pendentes'
      };
    }
  }

  // Buscar estatísticas do supervisor
  async getSupervisorStats() {
    try {
      const response = await api.get('/cotacoes/stats/supervisor');
      
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

  // Analisar cotação como supervisor
  async analisarCotacao(cotacaoId, dadosAnalise) {
    try {
      const response = await api.post(`/cotacoes/${cotacaoId}/analise-supervisor`, dadosAnalise);
      
      return {
        success: true,
        data: response.data.data || response.data,
        message: 'Análise realizada com sucesso'
      };
    } catch (error) {
      console.error('Erro ao analisar cotação:', error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Erro ao realizar análise'
      };
    }
  }

  // Aprovar cotação como supervisor
  async aprovarCotacao(cotacaoId, dadosAprovacao) {
    try {
      const response = await api.post(`/cotacoes/${cotacaoId}/aprovar-supervisor`, dadosAprovacao);
      
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

  // Rejeitar cotação como supervisor
  async rejeitarCotacao(cotacaoId, motivo) {
    try {
      const response = await api.post(`/cotacoes/${cotacaoId}/rejeitar-supervisor`, { motivo });
      
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

export default new SupervisorService();

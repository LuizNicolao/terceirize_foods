import { api } from './api';

class CotacoesService {
  // Buscar todas as cotações
  async getCotacoes(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      // Adicionar filtros como parâmetros de query
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      });

      const response = await api.get(`/cotacoes?${params.toString()}`);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar cotações'
      };
    }
  }

  // Buscar cotação por ID
  async getCotacaoById(id) {
    try {
      const response = await api.get(`/cotacoes/${id}`);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar cotação'
      };
    }
  }

  // Criar nova cotação
  async createCotacao(cotacaoData) {
    try {
      const response = await api.post('/cotacoes', cotacaoData);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao criar cotação'
      };
    }
  }

  // Atualizar cotação
  async updateCotacao(id, cotacaoData) {
    try {
      const response = await api.put(`/cotacoes/${id}`, cotacaoData);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao atualizar cotação'
      };
    }
  }

  // Excluir cotação
  async deleteCotacao(id) {
    try {
      const response = await api.delete(`/cotacoes/${id}`);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao excluir cotação'
      };
    }
  }

  // Enviar para supervisor
  async enviarParaSupervisor(id) {
    try {
      const response = await api.post(`/cotacoes/${id}/enviar-supervisor`);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao enviar para supervisor'
      };
    }
  }

  // Aprovar cotação
  async aprovarCotacao(id, dadosAprovacao) {
    try {
      const response = await api.post(`/cotacoes/${id}/aprovar`, dadosAprovacao);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao aprovar cotação'
      };
    }
  }

  // Rejeitar cotação
  async rejeitarCotacao(id, motivo) {
    try {
      const response = await api.post(`/cotacoes/${id}/rejeitar`, { motivo });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao rejeitar cotação'
      };
    }
  }

  // Buscar estatísticas
  async getStats() {
    try {
      const response = await api.get('/cotacoes/stats/overview');
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar estatísticas'
      };
    }
  }

  // Buscar cotações pendentes para supervisor
  async getCotacoesPendentesSupervisor() {
    try {
      const response = await api.get('/cotacoes/pendentes-supervisor');
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar cotações pendentes'
      };
    }
  }

  // Buscar aprovações
  async getAprovacoes() {
    try {
      const response = await api.get('/cotacoes/aprovacoes');
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar aprovações'
      };
    }
  }
}

export default new CotacoesService();

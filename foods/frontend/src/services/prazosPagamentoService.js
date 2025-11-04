import api from './api';

class PrazosPagamentoService {
  static async listar(filtros = {}) {
    try {
      const response = await api.get('/prazos-pagamento', { params: filtros });
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao listar prazos de pagamento'
      };
    }
  }

  static async buscarPorId(id) {
    try {
      const response = await api.get(`/prazos-pagamento/${id}`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar prazo de pagamento'
      };
    }
  }

  static async buscarAtivos() {
    try {
      const response = await api.get('/prazos-pagamento/ativas');
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar prazos de pagamento ativos'
      };
    }
  }

  static async criar(dados) {
    try {
      const response = await api.post('/prazos-pagamento', dados);
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao criar prazo de pagamento'
      };
    }
  }

  static async atualizar(id, dados) {
    try {
      const response = await api.put(`/prazos-pagamento/${id}`, dados);
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao atualizar prazo de pagamento'
      };
    }
  }

  static async excluir(id) {
    try {
      const response = await api.delete(`/prazos-pagamento/${id}`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao excluir prazo de pagamento'
      };
    }
  }

  static async exportarXLSX(params = {}) {
    try {
      const response = await api.get('/prazos-pagamento/export/xlsx', { 
        params,
        responseType: 'blob'
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao exportar dados'
      };
    }
  }

  static async exportarPDF(params = {}) {
    try {
      const response = await api.get('/prazos-pagamento/export/pdf', { 
        params,
        responseType: 'blob'
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao exportar dados'
      };
    }
  }
}

export default PrazosPagamentoService;


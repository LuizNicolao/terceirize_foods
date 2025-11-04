import api from './api';

class FormasPagamentoService {
  static async listar(filtros = {}) {
    try {
      const response = await api.get('/formas-pagamento', { params: filtros });
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao listar formas de pagamento'
      };
    }
  }

  static async buscarPorId(id) {
    try {
      const response = await api.get(`/formas-pagamento/${id}`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar forma de pagamento'
      };
    }
  }

  static async buscarAtivas() {
    try {
      const response = await api.get('/formas-pagamento/ativas');
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar formas de pagamento ativas'
      };
    }
  }

  static async criar(dados) {
    try {
      const response = await api.post('/formas-pagamento', dados);
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao criar forma de pagamento'
      };
    }
  }

  static async atualizar(id, dados) {
    try {
      const response = await api.put(`/formas-pagamento/${id}`, dados);
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao atualizar forma de pagamento'
      };
    }
  }

  static async excluir(id) {
    try {
      const response = await api.delete(`/formas-pagamento/${id}`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao excluir forma de pagamento'
      };
    }
  }

  static async exportarXLSX(params = {}) {
    try {
      const response = await api.get('/formas-pagamento/export/xlsx', { 
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
      const response = await api.get('/formas-pagamento/export/pdf', { 
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

export default FormasPagamentoService;


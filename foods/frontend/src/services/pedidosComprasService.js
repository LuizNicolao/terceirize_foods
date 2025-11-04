import api from './api';

class PedidosComprasService {
  static async listar(filtros = {}) {
    try {
      const response = await api.get('/pedidos-compras', { params: filtros });
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao listar pedidos de compras'
      };
    }
  }

  static async buscarPorId(id) {
    try {
      const response = await api.get(`/pedidos-compras/${id}`);
      
      // Extrair dados da estrutura HATEOAS
      let pedido = null;
      
      if (response.data.data) {
        pedido = response.data.data;
      } else if (response.data) {
        pedido = response.data;
      }
      
      return {
        success: true,
        data: pedido
      };
    } catch (error) {
      console.error('Erro ao buscar pedido:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar pedido de compras'
      };
    }
  }

  static async buscarSolicitacoesDisponiveis() {
    try {
      const response = await api.get('/pedidos-compras/solicitacoes-disponiveis');
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar solicitações disponíveis'
      };
    }
  }

  static async buscarItensSolicitacao(solicitacaoId) {
    try {
      const response = await api.get(`/pedidos-compras/itens-solicitacao/${solicitacaoId}`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar itens da solicitação'
      };
    }
  }

  static async buscarDadosFilial(filialId) {
    try {
      const response = await api.get(`/pedidos-compras/dados-filial/${filialId}`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar dados da filial'
      };
    }
  }

  static async criar(dados) {
    try {
      const response = await api.post('/pedidos-compras', dados);
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao criar pedido de compras'
      };
    }
  }

  static async atualizar(id, dados) {
    try {
      const response = await api.put(`/pedidos-compras/${id}`, dados);
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao atualizar pedido de compras'
      };
    }
  }

  static async excluir(id) {
    try {
      const response = await api.delete(`/pedidos-compras/${id}`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao excluir pedido de compras'
      };
    }
  }

  static async exportarXLSX(params = {}) {
    try {
      const response = await api.get('/pedidos-compras/export/xlsx', { 
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
      const response = await api.get('/pedidos-compras/export/pdf', { 
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

  static async aprovarPedidosEmLote(ids) {
    try {
      const response = await api.post('/pedidos-compras/acoes-em-lote/aprovar', { ids });
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao aprovar pedidos'
      };
    }
  }

  static async reabrirPedidosEmLote(ids) {
    try {
      const response = await api.post('/pedidos-compras/acoes-em-lote/reabrir', { ids });
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao reabrir pedidos'
      };
    }
  }
}

export default PedidosComprasService;


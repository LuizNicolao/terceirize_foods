import api from './api';

class RelatorioInspecaoService {
  async listar(params = {}) {
    try {
      const response = await api.get('/relatorio-inspecao', { params });
      
      // Extrair dados da estrutura HATEOAS
      let rirs = [];
      let pagination = null;
      
      if (response.data.data) {
        // Se tem data.items (estrutura HATEOAS)
        if (response.data.data.items) {
          rirs = response.data.data.items;
          pagination = response.data.data._meta?.pagination;
        } else {
          // Se data é diretamente um array
          rirs = response.data.data;
        }
      } else if (Array.isArray(response.data)) {
        // Se response.data é diretamente um array
        rirs = response.data;
      }
      
      return {
        success: true,
        data: rirs,
        pagination: pagination || response.data.pagination,
        statistics: response.data.statistics
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar relatórios de inspeção'
      };
    }
  }

  async buscarPorId(id) {
    try {
      const response = await api.get(`/relatorio-inspecao/${id}`);
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar relatório de inspeção'
      };
    }
  }

  async criar(data) {
    try {
      const response = await api.post('/relatorio-inspecao', data);
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Relatório de inspeção criado com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao criar relatório de inspeção',
        validationErrors: error.response?.data?.errors
      };
    }
  }

  async atualizar(id, data) {
    try {
      const response = await api.put(`/relatorio-inspecao/${id}`, data);
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Relatório de inspeção atualizado com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao atualizar relatório de inspeção',
        validationErrors: error.response?.data?.errors
      };
    }
  }

  async excluir(id) {
    try {
      const response = await api.delete(`/relatorio-inspecao/${id}`);
      return {
        success: true,
        message: response.data.message || 'Relatório de inspeção excluído com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao excluir relatório de inspeção'
      };
    }
  }

  // ========== APIs de Integração ==========

  async buscarProdutosPedido(pedidoId) {
    try {
      const response = await api.get('/relatorio-inspecao/buscar-produtos-pedido', {
        params: { id: pedidoId }
      });
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar produtos do pedido'
      };
    }
  }

  async buscarNQAGrupo(grupoId) {
    try {
      const response = await api.get('/relatorio-inspecao/buscar-nqa-grupo', {
        params: { grupo_id: grupoId }
      });
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar NQA do grupo'
      };
    }
  }

  async buscarPlanoPorLote(nqaId, tamanhoLote) {
    try {
      const response = await api.get('/relatorio-inspecao/buscar-plano-lote', {
        params: { nqa_id: nqaId, tamanho_lote: tamanhoLote }
      });
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar plano de amostragem'
      };
    }
  }

  async buscarPedidosAprovados() {
    try {
      const response = await api.get('/relatorio-inspecao/pedidos-aprovados');
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar pedidos aprovados'
      };
    }
  }

  async buscarGrupos() {
    try {
      const response = await api.get('/relatorio-inspecao/grupos');
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar grupos'
      };
    }
  }
}

export default new RelatorioInspecaoService();


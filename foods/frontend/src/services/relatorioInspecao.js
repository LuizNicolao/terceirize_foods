import api from './api';

class RelatorioInspecaoService {
  async listar(params = {}) {
    try {
      const response = await api.get('/relatorio-inspecao', { params });
      
      // Extrair dados da estrutura de resposta
      let rirs = [];
      let pagination = null;
      let statistics = null;
      
      if (response.data.data) {
        // Se tem data.items (estrutura HATEOAS)
        if (response.data.data.items) {
          rirs = response.data.data.items;
          pagination = response.data.data._meta?.pagination;
          statistics = response.data.data._meta?.statistics;
        } else {
          // Se data é diretamente um array
          rirs = response.data.data;
        }
      } else if (Array.isArray(response.data)) {
        // Se response.data é diretamente um array
        rirs = response.data;
      }
      
      // Se não conseguiu extrair paginação da estrutura HATEOAS, usar diretamente da resposta
      if (!pagination && response.data.pagination) {
        pagination = response.data.pagination;
      }
      if (!statistics && response.data.statistics) {
        statistics = response.data.statistics;
      }
      
      // Formatar paginação para o formato esperado pelo useBaseEntity
      let paginationData = null;
      if (pagination) {
        paginationData = {
          page: pagination.page || pagination.current_page || 1,
          pages: pagination.pages || pagination.total_pages || 1,
          total: pagination.total || pagination.total_items || 0,
          limit: pagination.limit || pagination.items_per_page || 20
        };
      }
      
      return {
        success: true,
        data: rirs,
        pagination: paginationData || response.data.pagination,
        statistics: statistics || response.data.statistics
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao carregar relatórios de inspeção'
      };
    }
  }

  async buscarPorId(id) {
    try {
      const response = await api.get(`/relatorio-inspecao/${id}`);
      
      // Extrair dados da estrutura de resposta
      let rir = null;
      
      if (response.data.data) {
        rir = response.data.data;
      } else {
        rir = response.data;
      }
      
      return {
        success: true,
        data: rir
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao buscar relatório de inspeção'
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
      if (error.response?.status === 422) {
        return {
          success: false,
          message: error.response.data.message || 'Dados inválidos',
          validationErrors: error.response.data.errors,
          errorCategories: error.response.data.errorCategories
        };
      }
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao criar relatório de inspeção'
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
      if (error.response?.status === 422) {
        return {
          success: false,
          message: error.response.data.message || 'Dados inválidos',
          validationErrors: error.response.data.errors,
          errorCategories: error.response.data.errorCategories
        };
      }
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao atualizar relatório de inspeção'
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
        message: error.response?.data?.message || 'Erro ao excluir relatório de inspeção'
      };
    }
  }

  // ========== APIs de Integração ==========

  async buscarProdutosPedido(pedidoId, rirId = null) {
    try {
      const params = { id: pedidoId };
      if (rirId) {
        params.rir_id = rirId;
      }
      const response = await api.get('/relatorio-inspecao/buscar-produtos-pedido', {
        params
      });
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao buscar produtos do pedido'
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
        message: error.response?.data?.message || 'Erro ao buscar NQA do grupo'
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
        message: error.response?.data?.message || 'Erro ao buscar plano de amostragem'
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
        message: error.response?.data?.message || 'Erro ao buscar pedidos aprovados'
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
        message: error.response?.data?.message || 'Erro ao buscar grupos'
      };
    }
  }

  async calcularSaldoPedido(pedidoId) {
    try {
      const response = await api.get(`/relatorio-inspecao/saldo-pedido/${pedidoId}`);
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao calcular saldo do pedido'
      };
    }
  }

  async desvincularProdutosPedido(pedidoId, itemIds = []) {
    try {
      const response = await api.delete(`/pedidos-compras/${pedidoId}/itens`, {
        data: { item_ids: itemIds }
      });
      return {
        success: true,
        message: response.data.message || 'Produtos desvinculados com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao desvincular produtos do pedido'
      };
    }
  }
}

export default new RelatorioInspecaoService();


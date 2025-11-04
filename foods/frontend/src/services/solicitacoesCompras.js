/**
 * Service para Solicitações de Compras
 * Gerencia todas as operações de API relacionadas a solicitações de compras
 */

import api from './api';

class SolicitacoesComprasService {
  async listar(params = {}) {
    try {
      const response = await api.get('/solicitacoes-compras', { params });
      
      // Extrair dados da estrutura de resposta
      let solicitacoes = [];
      let pagination = null;
      let statistics = null;
      
      if (response.data.data) {
        solicitacoes = response.data.data;
      } else if (Array.isArray(response.data)) {
        solicitacoes = response.data;
      }
      
      if (response.data.pagination) {
        pagination = response.data.pagination;
      }
      if (response.data.statistics) {
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
        data: solicitacoes,
        pagination: paginationData,
        statistics: statistics
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao carregar solicitações de compras'
      };
    }
  }

  async buscarPorId(id) {
    try {
      const response = await api.get(`/solicitacoes-compras/${id}`);
      
      // Extrair dados da estrutura de resposta
      let solicitacao = null;
      
      if (response.data.data) {
        solicitacao = response.data.data;
      } else {
        solicitacao = response.data;
      }
      
      return {
        success: true,
        data: solicitacao
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao buscar solicitação de compras'
      };
    }
  }

  async criar(data) {
    try {
      const response = await api.post('/solicitacoes-compras', data);
      
      // Extrair dados da estrutura de resposta
      let solicitacao = null;
      
      if (response.data.data) {
        solicitacao = response.data.data;
      } else {
        solicitacao = response.data;
      }
      
      return {
        success: true,
        data: solicitacao,
        message: 'Solicitação de compras criada com sucesso!'
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
        message: error.response?.data?.message || 'Erro ao criar solicitação de compras'
      };
    }
  }

  async atualizar(id, data) {
    try {
      const response = await api.put(`/solicitacoes-compras/${id}`, data);
      
      // Extrair dados da estrutura de resposta
      let solicitacao = null;
      
      if (response.data.data) {
        solicitacao = response.data.data;
      } else {
        solicitacao = response.data;
      }
      
      return {
        success: true,
        data: solicitacao,
        message: 'Solicitação de compras atualizada com sucesso!'
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
        message: error.response?.data?.message || 'Erro ao atualizar solicitação de compras'
      };
    }
  }

  async excluir(id) {
    try {
      await api.delete(`/solicitacoes-compras/${id}`);
      return {
        success: true,
        message: 'Solicitação de compras excluída com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao excluir solicitação de compras'
      };
    }
  }

  async buscarSemanaAbastecimento(dataEntrega) {
    try {
      const response = await api.post('/solicitacoes-compras/buscar-semana-abastecimento', {
        data_entrega: dataEntrega
      });
      
      // Extrair dados da estrutura de resposta
      let data = null;
      
      if (response.data.data) {
        data = response.data.data;
      } else {
        data = response.data;
      }
      
      return {
        success: true,
        data: data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao buscar semana de abastecimento'
      };
    }
  }

  async recalcularStatus(id) {
    try {
      const response = await api.post(`/solicitacoes-compras/${id}/recalcular-status`);
      
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao recalcular status'
      };
    }
  }

  async exportarXLSX(params = {}) {
    try {
      const response = await api.get('/solicitacoes-compras/export/xlsx', { 
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

  async exportarPDF(params = {}) {
    try {
      const response = await api.get('/solicitacoes-compras/export/pdf', { 
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

  async gerarPDF(id) {
    try {
      const response = await api.get(`/solicitacoes-compras/${id}/pdf`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      throw error;
    }
  }
}

export default new SolicitacoesComprasService();


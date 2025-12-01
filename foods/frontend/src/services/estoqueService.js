import api from './api';

class EstoqueService {
  async listar(params = {}) {
    try {
      const response = await api.get('/almoxarifado-estoque', { params });
      
      let estoques = [];
      let pagination = null;
      let statistics = null;
      
      // Estrutura padrão do successResponse: { success, data, meta: { pagination, statistics, links } }
      if (response.data) {
        // Dados podem estar em response.data ou response.data.data
      if (response.data.data) {
          if (Array.isArray(response.data.data)) {
            estoques = response.data.data;
          } else if (response.data.data.items) {
          estoques = response.data.data.items;
        } else {
          estoques = response.data.data;
        }
      } else if (Array.isArray(response.data)) {
        estoques = response.data;
      }
      
        // Meta pode estar em response.data.meta ou response.data._meta
        const meta = response.data.meta || response.data._meta;
        if (meta) {
          pagination = meta.pagination;
          statistics = meta.statistics;
        }
        
        // Fallback: procurar pagination e statistics diretamente em response.data
      if (!pagination) {
          pagination = response.data.pagination;
      }
      if (!statistics) {
          statistics = response.data.statistics;
        }
      }
      
      return {
        success: true,
        data: estoques,
        pagination: pagination,
        statistics: statistics
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao carregar estoques'
      };
    }
  }

  async buscarPorId(id) {
    try {
      const response = await api.get(`/almoxarifado-estoque/${id}`);
      
      let estoque = null;
      
      if (response.data.data) {
        estoque = response.data.data;
      } else {
        estoque = response.data;
      }
      
      return {
        success: true,
        data: estoque
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao buscar estoque'
      };
    }
  }

  async criar(data) {
    try {
      const response = await api.post('/almoxarifado-estoque', data);
      
      let estoque = null;
      
      if (response.data.data) {
        estoque = response.data.data;
      } else {
        estoque = response.data;
      }
      
      return {
        success: true,
        data: estoque,
        message: 'Estoque criado com sucesso!'
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
        message: error.response?.data?.message || 'Erro ao criar estoque'
      };
    }
  }

  async atualizar(id, data) {
    try {
      const response = await api.put(`/almoxarifado-estoque/${id}`, data);
      
      let estoque = null;
      
      if (response.data.data) {
        estoque = response.data.data;
      } else {
        estoque = response.data;
      }
      
      return {
        success: true,
        data: estoque,
        message: 'Estoque atualizado com sucesso!'
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
        message: error.response?.data?.message || 'Erro ao atualizar estoque'
      };
    }
  }

  async excluir(id) {
    try {
      await api.delete(`/almoxarifado-estoque/${id}`);
      return {
        success: true,
        message: 'Estoque excluído com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao excluir estoque'
      };
    }
  }

  /**
   * Buscar variações (lotes e validades) de um produto genérico
   */
  async buscarVariacoes(produtoGenericoId, params = {}) {
    try {
      const response = await api.get(`/almoxarifado-estoque/produto/${produtoGenericoId}/variacoes`, { params });
      
      let variacoes = [];
      
      if (response.data.data) {
        variacoes = Array.isArray(response.data.data) ? response.data.data : [response.data.data];
      } else if (Array.isArray(response.data)) {
        variacoes = response.data;
      }
      
      return {
        success: true,
        data: variacoes
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao buscar variações do produto'
      };
    }
  }

  /**
   * Exportar estoques para XLSX
   */
  async exportarXLSX(params = {}) {
    try {
      const response = await api.get('/almoxarifado-estoque/export/xlsx', {
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
        error: error.response?.data?.message || 'Erro ao exportar XLSX'
      };
    }
  }

  /**
   * Exportar estoques para PDF
   */
  async exportarPDF(params = {}) {
    try {
      const response = await api.get('/almoxarifado-estoque/export/pdf', {
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
        error: error.response?.data?.message || 'Erro ao exportar PDF'
      };
    }
  }

  /**
   * Obter opções de filtros disponíveis baseadas nos dados reais do banco
   */
  async obterOpcoesFiltros(params = {}) {
    try {
      const response = await api.get('/almoxarifado-estoque/filtros/opcoes', { params });
      
      let opcoes = null;
      
      if (response.data.data) {
        opcoes = response.data.data;
      } else {
        opcoes = response.data;
      }
      
      return {
        success: true,
        data: opcoes
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao obter opções de filtros'
      };
    }
  }
}

export default new EstoqueService();


import api from './api';

class NotaFiscalService {
  /**
   * Listar notas fiscais com paginação e filtros
   */
  async listar(params = {}) {
    try {
      const response = await api.get('/notas-fiscais', { params });
      
      // Extrair dados da estrutura HATEOAS
      let notasFiscais = [];
      let pagination = null;
      
      if (response.data) {
        // Se tem data.data.items (estrutura HATEOAS)
        if (response.data.data?.items && Array.isArray(response.data.data.items)) {
          notasFiscais = response.data.data.items;
          pagination = response.data.data._meta?.pagination;
        } 
        // Se tem data.data como array
        else if (response.data.data && Array.isArray(response.data.data)) {
          notasFiscais = response.data.data;
          pagination = response.data.data._meta?.pagination;
        }
        // Se data é diretamente um array
        else if (Array.isArray(response.data)) {
          notasFiscais = response.data;
        }
        // Se data é um objeto com items
        else if (response.data.items && Array.isArray(response.data.items)) {
          notasFiscais = response.data.items;
          pagination = response.data._meta?.pagination;
        }
      }
      
      // Garantir que sempre retornamos um array
      if (!Array.isArray(notasFiscais)) {
        notasFiscais = [];
      }
      
      return {
        success: true,
        data: notasFiscais,
        pagination: pagination || response.data?.pagination || response.data?.meta?.pagination
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar notas fiscais'
      };
    }
  }

  /**
   * Buscar nota fiscal por ID
   */
  async buscarPorId(id) {
    try {
      const response = await api.get(`/notas-fiscais/${id}`);
      
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar nota fiscal'
      };
    }
  }

  /**
   * Criar nova nota fiscal
   */
  async criar(notaFiscal) {
    try {
      const response = await api.post('/notas-fiscais', notaFiscal);
      
      return {
        success: true,
        data: response.data.data || response.data,
        message: 'Nota fiscal criada com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao criar nota fiscal',
        validationErrors: error.response?.data?.errors || error.response?.data
      };
    }
  }

  /**
   * Atualizar nota fiscal
   */
  async atualizar(id, notaFiscal) {
    try {
      const response = await api.put(`/notas-fiscais/${id}`, notaFiscal);
      
      return {
        success: true,
        data: response.data.data || response.data,
        message: 'Nota fiscal atualizada com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao atualizar nota fiscal'
      };
    }
  }

  /**
   * Excluir nota fiscal
   */
  async excluir(id) {
    try {
      await api.delete(`/notas-fiscais/${id}`);
      
      return {
        success: true,
        message: 'Nota fiscal excluída com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao excluir nota fiscal'
      };
    }
  }

  /**
   * Buscar quantidades já lançadas para um pedido de compra
   */
  async buscarQuantidadesLancadas(pedidoCompraId, notaFiscalId = null) {
    try {
      const params = notaFiscalId ? { nota_fiscal_id: notaFiscalId } : {};
      const response = await api.get(`/notas-fiscais/quantidades-lancadas/${pedidoCompraId}`, { params });
      
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar quantidades lançadas'
      };
    }
  }

  /**
   * Exportar notas fiscais para XLSX
   */
  async exportarXLSX(params = {}) {
    try {
      const response = await api.get('/notas-fiscais/export/xlsx', {
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
   * Exportar notas fiscais para PDF
   */
  async exportarPDF(params = {}) {
    try {
      const response = await api.get('/notas-fiscais/export/pdf', {
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
}

export default new NotaFiscalService();


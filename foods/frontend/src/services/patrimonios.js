import api from './api';

class PatrimoniosService {
  /**
   * Listar patrimônios com filtros e paginação
   */
  static async listarPatrimonios(params = {}) {
    try {
      const response = await api.get('/patrimonios', { params });
      
      // Extrair dados da estrutura HATEOAS
      let patrimonios = [];
      let pagination = null;
      
      if (response.data.data) {
        // Se tem data.items (estrutura HATEOAS)
        if (response.data.data.items) {
          patrimonios = response.data.data.items;
          pagination = response.data.data._meta?.pagination;
        } else {
          // Se data é diretamente um array
          patrimonios = response.data.data;
        }
      } else if (Array.isArray(response.data)) {
        // Se response.data é diretamente um array
        patrimonios = response.data;
      }
      
      return {
        success: true,
        data: patrimonios,
        pagination: pagination || response.data.pagination
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar patrimônios'
      };
    }
  }

  /**
   * Obter patrimônio específico
   */
  static async obterPatrimonio(id) {
    try {
      const response = await api.get(`/patrimonios/${id}`);
      
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar patrimônio'
      };
    }
  }

  /**
   * Criar novo patrimônio
   */
  static async criarPatrimonio(patrimonio) {
    try {
      const response = await api.post('/patrimonios', patrimonio);
      
      return {
        success: true,
        data: response.data.data,
        message: 'Patrimônio criado com sucesso!'
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
        error: error.response?.data?.message || 'Erro ao criar patrimônio'
      };
    }
  }

  /**
   * Atualizar patrimônio
   */
  static async atualizarPatrimonio(id, patrimonio) {
    try {
      const response = await api.put(`/patrimonios/${id}`, patrimonio);
      
      return {
        success: true,
        data: response.data.data,
        message: 'Patrimônio atualizado com sucesso!'
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
        error: error.response?.data?.message || 'Erro ao atualizar patrimônio'
      };
    }
  }

  /**
   * Excluir patrimônio
   */
  static async excluirPatrimonio(id) {
    try {
      const response = await api.delete(`/patrimonios/${id}`);
      
      return {
        success: true,
        message: 'Patrimônio excluído com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao excluir patrimônio'
      };
    }
  }

  /**
   * Movimentar patrimônio
   */
  static async movimentarPatrimonio(id, movimentacao) {
    try {
      const response = await api.post(`/patrimonios/${id}/movimentar`, movimentacao);
      
      return {
        success: true,
        message: 'Patrimônio movimentado com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || 'Erro ao movimentar patrimônio'
      };
    }
  }

  /**
   * Listar movimentações de um patrimônio
   */
  static async listarMovimentacoesPatrimonio(id, params = {}) {
    try {
      const response = await api.get(`/patrimonios/${id}/movimentacoes`, { params });
      
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar movimentações'
      };
    }
  }

  /**
   * Listar patrimônios de uma escola
   */
  static async listarPatrimoniosEscola(escolaId, params = {}) {
    try {
      const response = await api.get(`/patrimonios/escola/${escolaId}`, { params });
      
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar patrimônios da escola'
      };
    }
  }

  /**
   * Listar produtos que podem virar patrimônios
   */
  static async listarProdutosEquipamentos(params = {}) {
    try {
      const response = await api.get('/patrimonios/produtos/equipamentos', { params });
      
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar produtos equipamentos'
      };
    }
  }

  /**
   * Exportar patrimônios para XLSX
   */
  static async exportarXLSX(params = {}) {
    try {
      const response = await api.get('/patrimonios/export/xlsx', { 
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
        error: 'Erro ao exportar para XLSX'
      };
    }
  }

  /**
   * Exportar patrimônios para PDF
   */
  static async exportarPDF(params = {}) {
    try {
      const response = await api.get('/patrimonios/export/pdf', { 
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
        error: 'Erro ao exportar para PDF'
      };
    }
  }
}

export default PatrimoniosService;

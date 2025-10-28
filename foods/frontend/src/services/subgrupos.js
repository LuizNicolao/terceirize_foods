import api from './api';

class SubgruposService {
  /**
   * Listar subgrupos com paginação e filtros
   */
  static async listar(params = {}) {
    try {
      const response = await api.get('/subgrupos', { params });
      
      // Extrair dados da estrutura HATEOAS
      let subgrupos = [];
      let pagination = null;
      let statistics = null;
      
      if (response.data.data) {
        // Se tem data.items (estrutura HATEOAS)
        if (response.data.data.items) {
          subgrupos = response.data.data.items;
          pagination = response.data.data._meta?.pagination;
          statistics = response.data.data._meta?.statistics;
        } else {
          // Se data é diretamente um array
          subgrupos = response.data.data;
        }
      } else if (Array.isArray(response.data)) {
        // Se response.data é diretamente um array
        subgrupos = response.data;
      }
      
      // Se não conseguiu extrair paginação da estrutura HATEOAS, usar diretamente da resposta
      if (!pagination) {
        pagination = response.data.pagination || response.data.meta?.pagination;
      }
      if (!statistics) {
        statistics = response.data.statistics || response.data.meta?.statistics;
      }
      
      return {
        success: true,
        data: subgrupos,
        pagination: pagination || response.data.pagination || response.data.meta?.pagination,
        statistics: statistics || response.data.statistics || response.data.meta?.statistics
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao carregar subgrupos'
      };
    }
  }

  /**
   * Buscar subgrupo por ID
   */
  static async buscarPorId(id) {
    try {
      const response = await api.get(`/subgrupos/${id}`);
      
      // Extrair dados da estrutura HATEOAS
      let subgrupo = null;
      
      if (response.data.data) {
        subgrupo = response.data.data;
      } else {
        subgrupo = response.data;
      }
      
      return {
        success: true,
        data: subgrupo
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao buscar subgrupo'
      };
    }
  }

  /**
   * Obter próximo código disponível
   */
  static async obterProximoCodigo() {
    try {
      const response = await api.get('/subgrupos/proximo-codigo');
      
      // Extrair dados da estrutura HATEOAS
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
        message: error.response?.data?.message || 'Erro ao obter próximo código'
      };
    }
  }

  /**
   * Criar novo subgrupo
   */
  static async criar(data) {
    try {
      const response = await api.post('/subgrupos', data);
      
      // Extrair dados da estrutura HATEOAS
      let subgrupo = null;
      
      if (response.data.data) {
        subgrupo = response.data.data;
      } else {
        subgrupo = response.data;
      }
      
      return {
        success: true,
        data: subgrupo,
        message: 'Subgrupo criado com sucesso!'
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
        message: error.response?.data?.message || 'Erro ao criar subgrupo'
      };
    }
  }

  /**
   * Atualizar subgrupo
   */
  static async atualizar(id, data) {
    try {
      const response = await api.put(`/subgrupos/${id}`, data);
      
      // Extrair dados da estrutura HATEOAS
      let subgrupo = null;
      
      if (response.data.data) {
        subgrupo = response.data.data;
      } else {
        subgrupo = response.data;
      }
      
      return {
        success: true,
        data: subgrupo,
        message: 'Subgrupo atualizado com sucesso!'
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
        message: error.response?.data?.message || 'Erro ao atualizar subgrupo'
      };
    }
  }

  /**
   * Excluir subgrupo
   */
  static async excluir(id) {
    try {
      await api.delete(`/subgrupos/${id}`);
      return {
        success: true,
        message: 'Subgrupo excluído com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao excluir subgrupo'
      };
    }
  }

  /**
   * Buscar subgrupos ativos
   */
  static async buscarAtivos(params = {}) {
    try {
      const response = await api.get('/subgrupos/ativos', { params });
      
      // Extrair dados da estrutura HATEOAS
      let subgrupos = [];
      
      if (response.data.data) {
        // Se tem data.items (estrutura HATEOAS)
        if (response.data.data.items) {
          subgrupos = response.data.data.items;
        } else {
          // Se data é diretamente um array
          subgrupos = response.data.data;
        }
      } else if (response.data.items) {
        // Se tem items diretamente na resposta (estrutura HATEOAS)
        subgrupos = response.data.items;
      } else if (Array.isArray(response.data)) {
        // Se response.data é diretamente um array
        subgrupos = response.data;
      }
      
      return {
        success: true,
        data: subgrupos
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao carregar subgrupos ativos'
      };
    }
  }

  /**
   * Buscar subgrupos por grupo
   */
  static async buscarPorGrupo(grupoId, params = {}) {
    try {
      const response = await api.get(`/grupos/${grupoId}/subgrupos`, { params });
      
      // Extrair dados da estrutura HATEOAS
      let subgrupos = [];
      
      if (response.data.data) {
        // Se tem data.items (estrutura HATEOAS)
        if (response.data.data.items) {
          subgrupos = response.data.data.items;
        } else {
          // Se data é diretamente um array
          subgrupos = response.data.data;
        }
      } else if (Array.isArray(response.data)) {
        // Se response.data é diretamente um array
        subgrupos = response.data;
      }
      
      return {
        success: true,
        data: subgrupos
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao buscar subgrupos por grupo'
      };
    }
  }

  /**
   * Exportar subgrupos para XLSX
   */
  static async exportarXLSX(params = {}) {
    try {
      const response = await api.get('/subgrupos/export/xlsx', { 
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
        message: 'Erro ao exportar XLSX'
      };
    }
  }

  /**
   * Exportar subgrupos para PDF
   */
  static async exportarPDF(params = {}) {
    try {
      const response = await api.get('/subgrupos/export/pdf', { 
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
        message: 'Erro ao exportar PDF'
      };
    }
  }
}

export default SubgruposService; 
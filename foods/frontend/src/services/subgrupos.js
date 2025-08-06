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
      
      if (response.data.data) {
        // Se tem data.items (estrutura HATEOAS)
        if (response.data.data.items) {
          subgrupos = response.data.data.items;
          pagination = response.data.data._meta?.pagination;
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
        data: subgrupos,
        pagination: pagination || response.data.pagination
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar subgrupos'
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
        error: error.response?.data?.message || 'Erro ao buscar subgrupo'
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
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao criar subgrupo'
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
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao atualizar subgrupo'
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
        error: error.response?.data?.message || 'Erro ao excluir subgrupo'
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
        error: error.response?.data?.message || 'Erro ao carregar subgrupos ativos'
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
        error: error.response?.data?.message || 'Erro ao buscar subgrupos por grupo'
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
        error: 'Erro ao exportar XLSX'
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
        error: 'Erro ao exportar PDF'
      };
    }
  }
}

export default SubgruposService; 
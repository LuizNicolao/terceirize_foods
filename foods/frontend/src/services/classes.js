import api from './api';

class ClassesService {
  /**
   * Listar classes com paginação e filtros
   */
  static async listar(params = {}) {
    try {
      const response = await api.get('/classes', { params });
      
      // Extrair dados da estrutura HATEOAS
      let classes = [];
      let pagination = null;
      
      if (response.data.data) {
        // Se tem data.items (estrutura HATEOAS)
        if (response.data.data.items) {
          classes = response.data.data.items;
          pagination = response.data.data._meta?.pagination;
        } else {
          // Se data é diretamente um array
          classes = response.data.data;
        }
      } else if (Array.isArray(response.data)) {
        // Se response.data é diretamente um array
        classes = response.data;
      }
      
      return {
        success: true,
        data: classes,
        pagination: pagination || response.data.pagination
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao carregar classes'
      };
    }
  }

  /**
   * Buscar classe por ID
   */
  static async buscarPorId(id) {
    try {
      const response = await api.get(`/classes/${id}`);
      
      // Extrair dados da estrutura HATEOAS
      let classe = null;
      
      if (response.data.data) {
        classe = response.data.data;
      } else {
        classe = response.data;
      }
      
      return {
        success: true,
        data: classe
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao buscar classe'
      };
    }
  }

  /**
   * Obter próximo código disponível
   */
  static async obterProximoCodigo() {
    try {
      const response = await api.get('/classes/proximo-codigo');
      
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
   * Criar nova classe
   */
  static async criar(data) {
    try {
      const response = await api.post('/classes', data);
      
      // Extrair dados da estrutura HATEOAS
      let classe = null;
      
      if (response.data.data) {
        classe = response.data.data;
      } else {
        classe = response.data;
      }
      
      return {
        success: true,
        data: classe,
        message: 'Classe criada com sucesso!'
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
        message: error.response?.data?.message || 'Erro ao criar classe'
      };
    }
  }

  /**
   * Atualizar classe
   */
  static async atualizar(id, data) {
    try {
      const response = await api.put(`/classes/${id}`, data);
      
      // Extrair dados da estrutura HATEOAS
      let classe = null;
      
      if (response.data.data) {
        classe = response.data.data;
      } else {
        classe = response.data;
      }
      
      return {
        success: true,
        data: classe,
        message: 'Classe atualizada com sucesso!'
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
        message: error.response?.data?.message || 'Erro ao atualizar classe'
      };
    }
  }

  /**
   * Excluir classe
   */
  static async excluir(id) {
    try {
      await api.delete(`/classes/${id}`);
      return {
        success: true,
        message: 'Classe excluída com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao excluir classe'
      };
    }
  }

  /**
   * Buscar classes ativas
   */
  static async buscarAtivas(params = {}) {
    try {
      const response = await api.get('/classes', { params: { ...params, status: 1 } });
      
      // Extrair dados da estrutura HATEOAS
      let classes = [];
      
      if (response.data.data) {
        // Se tem data.items (estrutura HATEOAS)
        if (response.data.data.items) {
          classes = response.data.data.items;
        } else {
          // Se data é diretamente um array
          classes = response.data.data;
        }
      } else if (Array.isArray(response.data)) {
        // Se response.data é diretamente um array
        classes = response.data;
      }
      
      return {
        success: true,
        data: classes
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao carregar classes ativas'
      };
    }
  }

  /**
   * Buscar classes por subgrupo
   */
  static async buscarPorSubgrupo(subgrupoId, params = {}) {
    try {
      const response = await api.get(`/subgrupos/${subgrupoId}/classes`, { params });
      
      // Extrair dados da estrutura HATEOAS
      let classes = [];
      
      if (response.data.data) {
        // Se tem data.items (estrutura HATEOAS)
        if (response.data.data.items) {
          classes = response.data.data.items;
        } else {
          // Se data é diretamente um array
          classes = response.data.data;
        }
      } else if (Array.isArray(response.data)) {
        // Se response.data é diretamente um array
        classes = response.data;
      }
      
      return {
        success: true,
        data: classes
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao buscar classes por subgrupo'
      };
    }
  }

  /**
   * Exportar classes para XLSX
   */
  static async exportarXLSX(params = {}) {
    try {
      const response = await api.get('/classes/export/xlsx', { 
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
   * Exportar classes para XLSX
   */
  static async exportarXLSX(params = {}) {
    try {
      const response = await api.get('/classes/export/xlsx', { 
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
   * Exportar classes para PDF
   */
  static async exportarPDF(params = {}) {
    try {
      const response = await api.get('/classes/export/pdf', { 
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

export default ClassesService; 